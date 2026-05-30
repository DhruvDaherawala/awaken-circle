import { successResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/communities
 * Retrieves all communities sorted alphabetically by name,
 * including a count of their related events.
 */
async function handler(request) {
  const communities = await prisma.community.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  return successResponse(
    communities,
    "Communities retrieved successfully."
  );
}

// Export the GET method wrapped in our centralized, resilient error handler
export const GET = withErrorHandler(handler);
