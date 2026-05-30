import prisma from './prisma';

/**
 * Fetches all available community circles, ordered alphabetically by name.
 */
export async function getCommunities() {
  return await prisma.community.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches a single community circle details using its slug,
 * including active published events and linked circle testimonials.
 * 
 * @param {string} slug - The unique circle slug (e.g. 'awaken-run')
 */
export async function getCommunityBySlug(slug) {
  return await prisma.community.findUnique({
    where: { slug },
    include: {
      events: {
        where: { status: 'PUBLISHED' },
        orderBy: { eventDate: 'asc' },
      },
      testimonials: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * Fetches events based on dynamic options and category filters.
 * 
 * @param {object} options - Filters: communitySlug, category, featured, status
 */
export async function getEvents({ communitySlug, category, featured, status = 'PUBLISHED' } = {}) {
  const where = { status };

  if (communitySlug) {
    where.community = { slug: communitySlug };
  }
  if (category) {
    where.category = category;
  }
  if (featured !== undefined) {
    where.featured = featured;
  }

  return await prisma.event.findMany({
    where,
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
    },
    orderBy: { eventDate: 'asc' },
  });
}

/**
 * Fetches a single event with complete community contexts and current aggregate booking counts.
 * 
 * @param {string} slug - Unique event slug
 */
export async function getEventBySlug(slug) {
  return await prisma.event.findUnique({
    where: { slug },
    include: {
      community: true,
      _count: {
        select: { registrations: true },
      },
    },
  });
}

/**
 * Concurrency-safe event registration.
 * Wraps the capacity check and registration creation inside a database transaction to prevent overbooking.
 * 
 * @param {string} eventId - Target Event ID
 * @param {object} registrationData - Participant details (fullName, email, phone, age, emergencyContact, notes, etc.)
 */
export async function registerForEvent(eventId, registrationData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch event and aggregate registration count inside the transaction
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new Error("The selected event does not exist.");
    }

    if (event.status !== 'PUBLISHED') {
      throw new Error("This event is currently closed for new registrations.");
    }

    // 2. Enforce registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      throw new Error("The registration window for this event has closed.");
    }

    // 3. Enforce capacity limit
    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      throw new Error(`This event is fully booked (capacity capped at ${event.maxParticipants} participants).`);
    }

    // 4. Create registration record
    return await tx.registration.create({
      data: {
        eventId,
        ...registrationData,
      },
    });
  });
}

/**
 * Creates a new concierge contact desk submission.
 * 
 * @param {object} submissionData - Submission payload (name, email, phone, message)
 */
export async function createContactSubmission(submissionData) {
  return await prisma.contactSubmission.create({
    data: submissionData,
  });
}

/**
 * Fetches community media gallery photos.
 * 
 * @param {object} filters - Filter by communityId or eventId
 */
export async function getGalleryPhotos({ communityId, eventId, limit = 24 } = {}) {
  const where = {};

  if (communityId) where.communityId = communityId;
  if (eventId) where.eventId = eventId;

  return await prisma.gallery.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      community: {
        select: { name: true, slug: true },
      },
      event: {
        select: { title: true, slug: true },
      },
    },
  });
}
