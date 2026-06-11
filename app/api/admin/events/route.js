import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Advanced custom date parser that works with ISO strings, timestamps, or basic YYYY-MM-DD input
const dateStringSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid date format. Must be a valid parseable date string."
}).transform((val) => new Date(val));

// Event Creation Zod Schema
const eventCreateSchema = z.object({
  communityId: z.string({ required_error: "Community circle selection is required." }).min(1),
  title: z.string({ required_error: "Event title is required." }).min(2, "Title must be at least 2 characters.").max(150),
  slug: z.string({ required_error: "Event slug is required." })
    .min(2, "Slug must be at least 2 characters.")
    .max(180)
    .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores."),
  shortDescription: z.string().max(255).optional().nullable(),
  description: z.string({ required_error: "Event description is required." }).min(10, "Description must be at least 10 characters."),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  eventDate: dateStringSchema,
  eventTime: z.string({ required_error: "Event time is required." }).min(1).max(50),
  endTime: z.string().max(50).optional().nullable(),
  location: z.string({ required_error: "Event location is required." }).min(1).max(255),
  googleMapsLink: z.string().url("Invalid URL format.").optional().nullable().or(z.literal('')),
  price: z.coerce.number().min(0, "Price cannot be negative.").default(0.00),
  coverImage: z.string().max(255).optional().nullable().or(z.literal('')),
  galleryImages: z.array(z.string()).optional().nullable(),
  maxParticipants: z.coerce.number().int().positive("Max participants must be a positive number.").optional().nullable(),
  registrationDeadline: z.string().optional().nullable().or(z.literal(''))
    .transform((str) => str ? new Date(str) : null)
    .refine((date) => !date || !isNaN(date.getTime()), { message: "Invalid registration deadline date." }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).default('DRAFT'),
  featured: z.coerce.boolean().default(false),
});

/**
 * GET /api/admin/events
 * Admin dashboard route to fetch all events with community contexts, category information, 
 * and total participant registration count.
 * Supports filters: status, communityId, and text search.
 */
async function getHandler(request) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin privileges required.", 401);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const communityId = searchParams.get('communityId');
  const search = searchParams.get('search');

  // Build filters dynamically
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (communityId) {
    where.communityId = communityId;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { contains: search } }
    ];
  }

  // Fetch events sorted by creation date (newest first) for immediate visibility
  const events = await prisma.event.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
          themeColor: true,
          logo: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  return successResponse(
    events,
    `Successfully retrieved ${events.length} administrative event listings.`
  );
}

/**
 * POST /api/admin/events
 * Creates a brand new event. Performs complete validation and integrity checks.
 */
async function postHandler(request) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin privileges required.", 401);
  }

  // 2. Parse payload safely
  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return errorResponse("Invalid JSON body in request.", 400);
  }

  // 3. Zod validation
  const validationResult = eventCreateSchema.safeParse(payload);
  if (!validationResult.success) {
    // Formulate clean, client-friendly field errors
    const errors = validationResult.error.flatten().fieldErrors;
    return errorResponse("Validation failed. Please correct input fields.", 400, errors);
  }

  const data = validationResult.data;

  // 4. Batch all independent validation queries in parallel
  // This runs community, category, slug, and featured checks concurrently
  const [community, category, duplicateSlug, featuredCount] = await Promise.all([
    // A. Verify community exists
    prisma.community.findUnique({
      where: { id: data.communityId },
      select: { id: true },
    }),
    // B. Verify category exists if provided
    data.categoryId
      ? prisma.category.findUnique({
          where: { id: data.categoryId },
          select: { id: true },
        })
      : Promise.resolve(true), // Skip if no categoryId
    // C. Verify slug uniqueness
    prisma.event.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    }),
    // D. Count featured events (only if marking as featured)
    data.featured === true
      ? prisma.event.count({ where: { featured: true } })
      : Promise.resolve(0),
  ]);

  if (!community) {
    return errorResponse("Relational Integrity Failure: The specified community circle does not exist.", 400);
  }

  if (data.categoryId && !category) {
    return errorResponse("Relational Integrity Failure: The specified event category does not exist.", 400);
  }

  if (duplicateSlug) {
    return errorResponse("A unique constraint violation occurred: The slug is already taken.", 409, {
      slug: ["Slug must be unique. An event with this URL identifier already exists."]
    });
  }
  
  if (data.featured === true && featuredCount >= 3) {
    return errorResponse(
      "Maximum limit reached: A maximum of 3 events can be featured on the homepage simultaneously. Please unfeature another event before promoting this one.",
      400,
      { featured: ["Maximum of 3 featured events limit reached."] }
    );
  }

  // 6. Insert new Event record into DB
  const newEvent = await prisma.event.create({
    data: {
      communityId: data.communityId,
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      endTime: data.endTime,
      location: data.location,
      googleMapsLink: data.googleMapsLink,
      price: data.price,
      coverImage: data.coverImage,
      galleryImages: data.galleryImages ? JSON.stringify(data.galleryImages) : null,
      maxParticipants: data.maxParticipants,
      registrationDeadline: data.registrationDeadline,
      status: data.status,
      featured: data.featured,
    },
    include: {
      community: {
        select: { name: true, slug: true },
      },
      category: {
        select: { name: true },
      }
    }
  });

  return successResponse(
    newEvent,
    "Event successfully created.",
    201
  );
}

// Wrap handlers in our global gateway resilient error handler
export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
