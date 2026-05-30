import { successResponse, withErrorHandler } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/contact
 * Handles contact inquiry submissions and automatically registers the user
 * for an event if the inquiry is an event booking.
 */
async function handler(request) {
  const body = await request.json();
  const { name, email, phone, circle, message } = body;

  if (!name || !email || !phone || !message) {
    throw new Error("Missing required fields: name, email, phone, and message are required.");
  }

  // 1. Always store the record in the ContactSubmission table
  const submission = await prisma.contactSubmission.create({
    data: {
      name,
      email,
      phone,
      message,
    },
  });

  let registration = null;
  let eventMatched = null;

  // 2. If this is an event booking inquiry, try to automatically register the user for the event
  if (circle === 'event-booking') {
    // Try to extract the event title from the message (format is: I would like to book a spot for the event: "Event Title")
    const match = message.match(/event:\s*"([^"]+)"/i);
    const eventTitle = match ? match[1] : null;

    if (eventTitle) {
      // Find the event in the database by title
      eventMatched = await prisma.event.findFirst({
        where: {
          title: {
            equals: eventTitle.trim(),
          },
        },
      });

      // If exact match isn't found, try a case-insensitive search
      if (!eventMatched) {
        eventMatched = await prisma.event.findFirst({
          where: {
            title: {
              contains: eventTitle.trim(),
            },
          },
        });
      }
    }

    // If we matched a valid event in our database, register the user
    if (eventMatched) {
      registration = await prisma.registration.create({
        data: {
          eventId: eventMatched.id,
          fullName: name,
          email: email,
          phone: phone,
          notes: message,
          paymentStatus: eventMatched.price.toNumber() === 0 ? 'FREE' : 'PENDING',
          registrationStatus: 'PENDING',
        },
      });
      console.log(`Successfully registered ${name} (${email}) for event: "${eventMatched.title}"`);
    } else {
      console.log(`Could not find an event matching "${eventTitle || 'unknown'}" for registration, only contact submission saved.`);
    }
  }

  return successResponse(
    {
      submission,
      registration,
      eventMatched: eventMatched ? { id: eventMatched.id, title: eventMatched.title } : null,
    },
    registration 
      ? "Your spot has been pre-registered successfully! Our team will reach out shortly." 
      : "Inquiry received successfully! Our team will reach out shortly.",
    201
  );
}

export const POST = withErrorHandler(handler);
