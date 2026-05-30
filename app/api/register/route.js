import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/register
 * Registers a user for an Awaken Circle event with thorough validation and constraint checks.
 */
async function handler(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return errorResponse("Invalid JSON payload provided.", 400);
  }

  const {
    fullName,
    email,
    phone,
    age,
    gender,
    city,
    eventId,
    emergencyContact,
    notes
  } = body;

  // 1. Production-ready Validation
  const validationErrors = {};

  // Full Name validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    validationErrors.fullName = "Full name is required and must be a valid text string.";
  } else if (fullName.trim().length > 100) {
    validationErrors.fullName = "Full name cannot exceed 100 characters.";
  }

  // Email validation
  if (!email || typeof email !== 'string' || email.trim() === '') {
    validationErrors.email = "Email address is required.";
  } else {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 100) {
      validationErrors.email = "Email address cannot exceed 100 characters.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.email = "Please provide a valid email format (e.g. name@example.com).";
    }
  }

  // Phone validation
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    validationErrors.phone = "Phone number is required.";
  } else {
    const trimmedPhone = phone.trim();
    if (!/^\+?[0-9\s\-()]{10,20}$/.test(trimmedPhone)) {
      validationErrors.phone = "Please provide a valid 10-20 digit phone number (spaces, hyphens, and parentheses allowed).";
    }
  }

  // Age validation
  if (age === undefined || age === null || String(age).trim() === '') {
    validationErrors.age = "Age is required.";
  } else {
    const ageNum = Number(age);
    if (isNaN(ageNum)) {
      validationErrors.age = "Age must be a valid integer number.";
    } else if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
      validationErrors.age = "Please enter a valid age between 1 and 120.";
    }
  }

  // Gender validation
  if (!gender || typeof gender !== 'string' || gender.trim() === '') {
    validationErrors.gender = "Gender selection is required.";
  } else {
    const trimmedGender = gender.trim();
    if (trimmedGender.length > 30) {
      validationErrors.gender = "Gender field cannot exceed 30 characters.";
    }
  }

  // City validation
  if (!city || typeof city !== 'string' || city.trim() === '') {
    validationErrors.city = "City is required.";
  } else if (city.trim().length > 100) {
    validationErrors.city = "City name cannot exceed 100 characters.";
  }

  // Event Selection validation
  if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
    validationErrors.eventId = "The target event ID is required.";
  }

  // Optional: Emergency Contact validation (if provided)
  if (emergencyContact && (typeof emergencyContact !== 'string' || emergencyContact.trim().length > 50)) {
    validationErrors.emergencyContact = "Emergency contact info cannot exceed 50 characters.";
  }

  // Optional: Notes validation (if provided)
  if (notes && (typeof notes !== 'string' || notes.trim().length > 2000)) {
    validationErrors.notes = "Special notes/requests cannot exceed 2000 characters.";
  }

  // Return validation block if any checks failed
  if (Object.keys(validationErrors).length > 0) {
    return errorResponse("Registration form validation failed.", 400, validationErrors);
  }

  // 2. Fetch target event and verify metadata
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return errorResponse("The selected event does not exist in our system.", 404);
  }

  // Respect visibility constraints (allow bookings only for published events)
  if (event.status !== 'PUBLISHED') {
    return errorResponse("This gathering is not accepting registrations at this time.", 400);
  }

  const now = new Date();

  // Respect chronological deadline constraints
  if (event.registrationDeadline && new Date(event.registrationDeadline) < now) {
    return errorResponse("Registration for this event is closed because the sign-up deadline has passed.", 400);
  }

  // Respect event date (cannot register for past events)
  if (new Date(event.eventDate) < now) {
    return errorResponse("This event has already taken place and is closed for registration.", 400);
  }

  // 3. Respect event capacity limits (Evaluate active confirmed/pending registrations)
  const registrationsCount = await prisma.registration.count({
    where: {
      eventId: event.id,
      NOT: {
        registrationStatus: 'CANCELLED'
      }
    }
  });

  if (event.maxParticipants && registrationsCount >= event.maxParticipants) {
    return errorResponse("This circle is fully booked. All spots are sold out!", 400);
  }

  // 4. Prevent duplicate registrations (Verify same email or phone for this event)
  const existingRegistration = await prisma.registration.findFirst({
    where: {
      eventId: event.id,
      OR: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() }
      ]
    }
  });

  if (existingRegistration) {
    if (existingRegistration.email.toLowerCase().trim() === email.toLowerCase().trim()) {
      return errorResponse("You have already registered for this circle using this email address.", 409);
    } else {
      return errorResponse("You have already registered for this circle using this phone number.", 409);
    }
  }

  // 5. Determine default statuses
  // Free events are immediately CONFIRMED / FREE. Paid events are PENDING payment.
  const isFree = !event.price || Number(event.price) === 0;
  const paymentStatus = isFree ? 'FREE' : 'PENDING';
  const registrationStatus = isFree ? 'CONFIRMED' : 'PENDING';

  // 6. Record the registration in Prisma
  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      age: Number(age),
      gender: gender.trim(),
      city: city.trim(),
      emergencyContact: emergencyContact ? emergencyContact.trim() : null,
      notes: notes ? notes.trim() : null,
      paymentStatus,
      registrationStatus
    },
    include: {
      event: {
        select: {
          title: true,
          eventDate: true,
          eventTime: true,
          location: true,
          price: true
        }
      }
    }
  });

  // 7. Return success response
  const responseMsg = isFree 
    ? `Congratulations! Your spot at "${event.title}" is confirmed.`
    : `Pre-registration for "${event.title}" received! Please complete the pending fee to secure your spot.`;

  return successResponse(
    registration,
    responseMsg,
    201
  );
}

export const POST = withErrorHandler(handler);
