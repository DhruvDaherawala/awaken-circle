import { successResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/categories
 * Retrieves all event categories sorted alphabetically by name.
 */
async function handler() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return successResponse(
    categories,
    "Categories retrieved successfully."
  );
}

export const GET = withErrorHandler(handler);
