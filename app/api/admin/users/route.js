import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';

/**
 * GET /api/admin/users
 * Lists all admin users. SUPERADMIN only.
 */
async function getHandler(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return errorResponse('Unauthorized. Please sign in.', 401);
  }

  if (session.user.role !== 'SUPERADMIN') {
    return errorResponse('Access denied. Only Superadmin can manage users.', 403);
  }

  const users = await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(users, 'Users retrieved successfully.');
}

/**
 * POST /api/admin/users
 * Creates a new Admin or Editor profile. SUPERADMIN only.
 */
async function postHandler(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return errorResponse('Unauthorized. Please sign in.', 401);
  }

  if (session.user.role !== 'SUPERADMIN') {
    return errorResponse('Access denied. Only Superadmin can create new users.', 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload.', 400);
  }

  const { name, email, password, role } = body;

  // Validate required fields
  const validationErrors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    validationErrors.name = 'Name is required and must be at least 2 characters.';
  } else if (name.trim().length > 100) {
    validationErrors.name = 'Name cannot exceed 100 characters.';
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    validationErrors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    validationErrors.email = 'Please provide a valid email address.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    validationErrors.password = 'Password is required and must be at least 6 characters.';
  }

  const allowedRoles = ['ADMIN', 'EDITOR'];
  if (!role || !allowedRoles.includes(role)) {
    validationErrors.role = 'Role must be either ADMIN or EDITOR.';
  }

  if (Object.keys(validationErrors).length > 0) {
    return errorResponse('Validation failed.', 400, validationErrors);
  }

  // Check if email already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingAdmin) {
    return errorResponse('An account with this email already exists.', 409);
  }

  // Hash password and create the user
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.admin.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return successResponse(newUser, `${role} account created successfully.`, 201);
}

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
