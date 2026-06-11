import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { deleteImage, extractPublicId } from '@/lib/cloudinary';
import { z } from 'zod';

// Advanced custom date parser that works with ISO strings, timestamps, or basic YYYY-MM-DD input
const dateStringSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid date format. Must be a valid parseable date string."
}).transform((val) => new Date(val));

// Event Update Zod Schema (Supports partial updates for maximum flexibility)
const eventUpdateSchema = z.object({
  communityId: z.string().min(1).optional(),
  title: z.string().min(2).max(150).optional(),
  slug: z.string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores.")
    .optional(),
  shortDescription: z.string().max(255).optional().nullable(),
  description: z.string().min(10).optional(),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  eventDate: dateStringSchema.optional(),
  eventTime: z.string().min(1).max(50).optional(),
  endTime: z.string().max(50).optional().nullable(),
  location: z.string().min(1).max(255).optional(),
  googleMapsLink: z.string().url("Invalid URL format.").optional().nullable().or(z.literal('')),
  price: z.coerce.number().min(0, "Price cannot be negative.").optional(),
  coverImage: z.string().max(255).optional().nullable().or(z.literal('')),
  galleryImages: z.array(z.string()).optional().nullable(),
  maxParticipants: z.coerce.number().int().positive("Max participants must be a positive number.").optional().nullable(),
  registrationDeadline: z.string().optional().nullable().or(z.literal(''))
    .transform((str) => str ? new Date(str) : null)
    .refine((date) => !date || !isNaN(date.getTime()), { message: "Invalid registration deadline date." })
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  featured: z.coerce.boolean().optional(),
});

/**
 * PUT /api/admin/events/[id]
 * Updates an existing event by its unique ID.
 * Implements strict validations and performs auto-cleanup of replaced Cloudinary images.
 */
async function putHandler(request, { params }) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin privileges required.", 401);
  }

  const { id } = await params;
  if (!id) {
    return errorResponse("Missing required parameter: Event ID.", 400);
  }

  // 2. Verify event exists in database first
  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });
  if (!existingEvent) {
    return errorResponse("The requested event does not exist.", 404);
  }

  // 3. Parse and validate payload
  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return errorResponse("Invalid JSON body in request.", 400);
  }

  const validationResult = eventUpdateSchema.safeParse(payload);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return errorResponse("Validation failed. Please correct input fields.", 400, errors);
  }

  const data = validationResult.data;

  // 4. Batch all independent validation queries in parallel
  const [community, category, duplicateSlug, featuredCount] = await Promise.all([
    data.communityId
      ? prisma.community.findUnique({ where: { id: data.communityId }, select: { id: true } })
      : Promise.resolve(true),
    data.categoryId
      ? prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } })
      : Promise.resolve(true),
    data.slug
      ? prisma.event.findFirst({ where: { slug: data.slug, NOT: { id } }, select: { id: true } })
      : Promise.resolve(null),
    data.featured === true
      ? prisma.event.count({ where: { featured: true, NOT: { id } } })
      : Promise.resolve(0),
  ]);

  if (data.communityId && !community) {
    return errorResponse("Relational Integrity Failure: The specified community circle does not exist.", 400);
  }

  if (data.categoryId && !category) {
    return errorResponse("Relational Integrity Failure: The specified event category does not exist.", 400);
  }

  if (data.slug && duplicateSlug) {
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

  // 6. Handle Cloudinary cover image replacement cleanup
  // If the cover image changed, identify the old image's public_id and trigger background deletion
  if (data.coverImage !== undefined && existingEvent.coverImage && existingEvent.coverImage !== data.coverImage) {
    const oldPublicId = extractPublicId(existingEvent.coverImage);
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
        console.log(`Cloudinary Cleanup: Successfully deleted replaced cover image (${oldPublicId})`);
      } catch (err) {
        console.error(`Cloudinary Cleanup Error: Failed to delete old cover image (${oldPublicId}):`, err.message);
        // We log the error but don't halt the update transaction
      }
    }
  }

  // 7. Perform update in database
  const updatedEvent = await prisma.event.update({
    where: { id },
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
      galleryImages: data.galleryImages ? JSON.stringify(data.galleryImages) : undefined,
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
    updatedEvent,
    "Event listing successfully updated."
  );
}

/**
 * DELETE /api/admin/events/[id]
 * Deletes an event by its ID.
 * Cascade deletes linked registrations (handled automatically by Prisma/MySQL FK setup)
 * and cleans up its cover image from Cloudinary if hosted there.
 */
async function deleteHandler(request, { params }) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin privileges required.", 401);
  }

  const { id } = await params;
  if (!id) {
    return errorResponse("Missing required parameter: Event ID.", 400);
  }

  // 2. Fetch event to get image reference before deletion
  const event = await prisma.event.findUnique({
    where: { id },
  });
  if (!event) {
    return errorResponse("The requested event does not exist or has already been deleted.", 404);
  }

  // 3. Delete event record from database
  // Note: Prisma relations schema uses `onDelete: Cascade` for linked event registrations
  await prisma.event.delete({
    where: { id },
  });

  // 4. Perform Cloudinary asset cleanup
  if (event.coverImage) {
    const publicId = extractPublicId(event.coverImage);
    if (publicId) {
      try {
        await deleteImage(publicId);
        console.log(`Cloudinary Cleanup: Successfully deleted cover image (${publicId}) associated with event ${id}`);
      } catch (err) {
        console.error(`Cloudinary Cleanup Error: Failed to delete cover image (${publicId}) during event deletion:`, err.message);
        // Do not crash the success response, just log the cleanup failure
      }
    }
  }

  return successResponse(
    { id },
    "Event listing and all associated registration records successfully deleted."
  );
}

// Export wrapped PUT and DELETE methods
export const PUT = withErrorHandler(putHandler);
export const DELETE = withErrorHandler(deleteHandler);
