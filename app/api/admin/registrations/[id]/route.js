import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Registration Update Zod Schema - supports both uppercase database standard and client variations
const registrationUpdateSchema = z.object({
  paymentStatus: z.enum([
    'PENDING', 'PAID', 'REFUNDED', 'FAILED', 'FREE',
    'Pending', 'Paid', 'Refunded', 'Failed', 'Free',
    'pending', 'paid', 'refunded', 'failed', 'free'
  ]).optional(),
  registrationStatus: z.enum([
    'PENDING', 'CONFIRMED', 'CHECKED_IN', 'ATTENDED', 'CANCELLED',
    'Pending', 'Confirmed', 'CheckedIn', 'Checked_In', 'Attended', 'Cancelled',
    'pending', 'confirmed', 'checkedin', 'checked_in', 'attended', 'cancelled'
  ]).optional(),
});

/**
 * PUT /api/admin/registrations/[id]
 * Updates an existing registration record.
 * Validates status transitions and enforces event capacity constraints.
 */
async function putHandler(request, { params }) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin privileges required.", 401);
  }

  const { id } = await params;
  if (!id) {
    return errorResponse("Missing required parameter: Registration ID.", 400);
  }

  // 2. Fetch current registration record
  const existingReg = await prisma.registration.findUnique({
    where: { id },
  });
  if (!existingReg) {
    return errorResponse("The requested registration record does not exist.", 404);
  }

  // 3. Parse and validate body
  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return errorResponse("Invalid JSON body in request.", 400);
  }

  const validationResult = registrationUpdateSchema.safeParse(payload);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return errorResponse("Validation failed. Please correct input fields.", 400, errors);
  }

  // Copy parsed validated parameters
  const data = { ...validationResult.data };

  // Map case-insensitive input values to database-safe uppercase enums
  if (data.registrationStatus) {
    const statusMap = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'checkedin': 'CHECKED_IN',
      'checked_in': 'CHECKED_IN',
      'attended': 'ATTENDED',
      'cancelled': 'CANCELLED',
      
      'PENDING': 'PENDING',
      'CONFIRMED': 'CONFIRMED',
      'CHECKED_IN': 'CHECKED_IN',
      'ATTENDED': 'ATTENDED',
      'CANCELLED': 'CANCELLED'
    };
    
    const lookupKey = data.registrationStatus.toLowerCase().replace(/_/g, '');
    const mapped = statusMap[lookupKey];
    if (!mapped) {
      return errorResponse(`Invalid registrationStatus value provided: ${data.registrationStatus}`, 400);
    }
    data.registrationStatus = mapped;
  }

  if (data.paymentStatus) {
    const paymentMap = {
      'pending': 'PENDING',
      'paid': 'PAID',
      'refunded': 'REFUNDED',
      'failed': 'FAILED',
      'free': 'FREE',
      
      'PENDING': 'PENDING',
      'PAID': 'PAID',
      'REFUNDED': 'REFUNDED',
      'FAILED': 'FAILED',
      'FREE': 'FREE'
    };
    
    const lookupKey = data.paymentStatus.toLowerCase();
    const mappedPay = paymentMap[lookupKey];
    if (!mappedPay) {
      return errorResponse(`Invalid paymentStatus value provided: ${data.paymentStatus}`, 400);
    }
    data.paymentStatus = mappedPay;
  }

  // 4. Enforce capacity limits if transitioning to an active attendee status (CONFIRMED, CHECKED_IN, ATTENDED)
  const activeStatuses = ['CONFIRMED', 'CHECKED_IN', 'ATTENDED'];
  const wasActive = activeStatuses.includes(existingReg.registrationStatus);
  const isNowActive = data.registrationStatus ? activeStatuses.includes(data.registrationStatus) : false;

  if (isNowActive && !wasActive) {
    const event = await prisma.event.findUnique({
      where: { id: existingReg.eventId },
      select: {
        id: true,
        title: true,
        maxParticipants: true,
        // Use _count aggregate instead of loading all registration IDs
        _count: {
          select: {
            registrations: {
              where: { registrationStatus: { in: activeStatuses } }
            }
          }
        }
      }
    });

    if (!event) {
      return errorResponse("Relational Integrity Failure: The associated event does not exist.", 400);
    }

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return errorResponse(`Capacity violation: Cannot confirm spot. The event "${event.title}" is already at full capacity (${event.maxParticipants} slots).`, 400);
    }
  }

  // 5. Manage checkedInAt timestamp update automatically
  let checkedInAt = undefined;
  if (data.registrationStatus === 'CHECKED_IN') {
    // Only set check-in timestamp if not already checked in
    checkedInAt = existingReg.checkedInAt || new Date();
  } else if (data.registrationStatus && ['PENDING', 'CANCELLED'].includes(data.registrationStatus)) {
    // Reset check-in timestamp if reverting back to pending or cancelled
    checkedInAt = null;
  }

  // 6. Perform database update
  const updatedReg = await prisma.registration.update({
    where: { id },
    data: {
      paymentStatus: data.paymentStatus,
      registrationStatus: data.registrationStatus,
      checkedInAt: checkedInAt,
    },
    include: {
      event: {
        select: {
          title: true,
          price: true,
        }
      }
    }
  });

  return successResponse(
    updatedReg,
    "Registration record successfully updated."
  );
}

/**
 * DELETE /api/admin/registrations/[id]
 * Permanently deletes a registration record from the system.
 */
async function deleteHandler(request, { params }) {
  // 1. Authenticate administrative session (Delete is high privilege, restrict to SUPERADMIN and ADMIN only)
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
    return errorResponse("Unauthorized: Admin or Superadmin privileges required to delete logs.", 401);
  }

  const { id } = await params;
  if (!id) {
    return errorResponse("Missing required parameter: Registration ID.", 400);
  }

  // 2. Verify registration exists
  const registration = await prisma.registration.findUnique({
    where: { id },
  });
  if (!registration) {
    return errorResponse("The requested registration record does not exist or has already been deleted.", 404);
  }

  // 3. Delete from database
  await prisma.registration.delete({
    where: { id },
  });

  return successResponse(
    { id },
    "Registration record permanently deleted from system logs."
  );
}

export const PUT = withErrorHandler(putHandler);
export const DELETE = withErrorHandler(deleteHandler);
