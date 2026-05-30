import { successResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/events
 * Fetches all upcoming events with related community details.
 * Supports query parameter filtering:
 *  - category: string
 *  - featured: 'true' | 'false'
 *  - community: string (slug of the community)
 *  - communitySlug: string (alias for community slug)
 * Sorts events chronologically (nearest first).
 */
async function handler(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const communitySlug = searchParams.get('communitySlug') || searchParams.get('community');

  const now = new Date();

  // Base query filter: only upcoming events that are published
  const where = {
    eventDate: {
      gte: now,
    },
    status: 'PUBLISHED',
  };

  // Filter by category if provided
  if (category) {
    where.category = {
      slug: category
    };
  }

  // Filter by featured status if provided
  if (featured !== null) {
    where.featured = featured === 'true';
  }

  // Filter by community slug (joined relation) if provided
  if (communitySlug) {
    where.community = {
      slug: communitySlug,
    };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: {
      eventDate: 'asc', // Nearest event date first
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
        }
      }
    },
  });

  return successResponse(
    events,
    `Successfully retrieved ${events.length} upcoming events.`
  );
}

// Export the GET method wrapped in our centralized, resilient error handler
export const GET = withErrorHandler(handler);
