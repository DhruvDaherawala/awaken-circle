import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';

/**
 * DELETE /api/admin/users/[id]
 * Deletes an admin/editor user. SUPERADMIN only.
 * Cannot delete yourself or another SUPERADMIN.
 */
async function deleteHandler(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return errorResponse('Unauthorized. Please sign in.', 401);
  }

  if (session.user.role !== 'SUPERADMIN') {
    return errorResponse('Access denied. Only Superadmin can delete users.', 403);
  }

  const { id } = await params;

  if (!id) {
    return errorResponse('User ID is required.', 400);
  }

  // Prevent self-deletion
  if (id === session.user.id) {
    return errorResponse('You cannot delete your own account.', 400);
  }

  // Fetch the target user
  const targetUser = await prisma.admin.findUnique({
    where: { id },
  });

  if (!targetUser) {
    return errorResponse('User not found.', 404);
  }

  // Prevent deleting other SUPERADMINs
  if (targetUser.role === 'SUPERADMIN') {
    return errorResponse('Cannot delete a Superadmin account.', 403);
  }

  await prisma.admin.delete({
    where: { id },
  });

  return successResponse(null, `User "${targetUser.name}" has been deleted.`);
}

export const DELETE = withErrorHandler(deleteHandler);
