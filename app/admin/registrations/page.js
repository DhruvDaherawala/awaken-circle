import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RegistrationsManagerClient from './RegistrationsManagerClient';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/registrations
 * Admin registrations dashboard. Performs secure server-side session checks 
 * and hydrates database records (registrations, events, communities) directly.
 */
export default async function AdminRegistrationsPage() {
  // Fetch active admin session on the server
  const session = await getServerSession(authOptions);

  // Safeguard: if session is missing, redirect securely to login
  if (!session) {
    redirect('/admin/login');
  }

  // Hydrate all registrations with their associated events and communities
  const registrations = await prisma.registration.findMany({
    include: {
      event: {
        select: {
          id: true,
          title: true,
          price: true,
          eventDate: true,
          eventTime: true,
          location: true,
          community: {
            select: {
              id: true,
              name: true,
              themeColor: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch all events for dropdown filtering
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true
    },
    orderBy: {
      title: 'asc'
    }
  });

  // Fetch all communities for dropdown filtering
  const communities = await prisma.community.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Serialize dates safely for Next.js Server-to-Client prop pass
  const serializedRegistrations = registrations.map(reg => ({
    ...reg,
    createdAt: reg.createdAt.toISOString(),
    updatedAt: reg.updatedAt.toISOString(),
    checkedInAt: reg.checkedInAt ? reg.checkedInAt.toISOString() : null,
    event: {
      ...reg.event,
      eventDate: reg.event.eventDate ? reg.event.eventDate.toISOString() : null
    }
  }));

  return (
    <RegistrationsManagerClient 
      session={session} 
      initialRegistrations={serializedRegistrations} 
      events={events}
      communities={communities}
    />
  );
}
