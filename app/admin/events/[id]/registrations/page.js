import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EventRegistrationsClient from './EventRegistrationsClient';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/events/[id]/registrations
 * Server-rendered dashboard entry for registrations specific to a single gathering.
 */
export default async function EventRegistrationsPage({ params }) {
  // Fetch active admin session on the server
  const session = await getServerSession(authOptions);

  // Safeguard: if session is missing, redirect securely to login
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  if (!id) {
    notFound();
  }

  // Fetch the selected event with its corresponding community, category, and all registration profiles
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
          themeColor: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      registrations: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  // If event does not exist, return a clean 404
  if (!event) {
    notFound();
  }

  // Safely serialize dates to prevent Next.js prop transfer warnings
  const serializedEvent = {
    ...event,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    eventDate: event.eventDate ? event.eventDate.toISOString() : null,
    registrationDeadline: event.registrationDeadline ? event.registrationDeadline.toISOString() : null,
    registrations: event.registrations.map(reg => ({
      ...reg,
      createdAt: reg.createdAt.toISOString(),
      updatedAt: reg.updatedAt.toISOString(),
      checkedInAt: reg.checkedInAt ? reg.checkedInAt.toISOString() : null
    }))
  };

  return (
    <EventRegistrationsClient 
      session={session} 
      event={serializedEvent} 
    />
  );
}
