import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';

/**
 * POST /api/admin/change-password
 * Allows any authenticated admin (SUPERADMIN, ADMIN, EDITOR) to change their own password.
 * Requires verification of the current (old) password before accepting a new one.
 */
async function handler(request) {
  // 1. Verify the session is authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return errorResponse('Unauthorized. Please sign in.', 401);
  }

  // 2. Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload.', 400);
  }

  const { oldPassword, newPassword, confirmPassword } = body;

  // 3. Validate all fields are present
  if (!oldPassword || !newPassword || !confirmPassword) {
    return errorResponse('All fields are required: old password, new password, and confirm password.', 400);
  }

  // 4. Validate new password length
  if (newPassword.length < 6) {
    return errorResponse('New password must be at least 6 characters long.', 400);
  }

  // 5. Validate new password matches confirmation
  if (newPassword !== confirmPassword) {
    return errorResponse('New password and confirmation do not match.', 400);
  }

  // 6. Retrieve the admin user from the database
  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
  });

  if (!admin) {
    return errorResponse('Admin account not found.', 404);
  }

  // 7. Verify the old password is correct
  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);
  if (!isOldPasswordCorrect) {
    return errorResponse('Current password is incorrect.', 403);
  }

  // 8. Prevent setting the same password
  const isSamePassword = await bcrypt.compare(newPassword, admin.password);
  if (isSamePassword) {
    return errorResponse('New password must be different from the current password.', 400);
  }

  // 9. Hash the new password and update the record
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedNewPassword },
  });

  return successResponse(null, 'Password changed successfully.');
}

export const POST = withErrorHandler(handler);
