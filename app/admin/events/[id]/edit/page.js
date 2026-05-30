import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EditEventClient from './EditEventClient';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/events/[id]/edit
 * Server-side session guard and pre-hydration data gate for editing an event.
 */
export default async function AdminEventEditPage({ params }) {
  // 1. Authenticate administrative session
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  if (!id) {
    redirect('/admin/events');
  }

  // 2. Pre-fetch all necessary relational datasets in parallel on the server
  const [event, communities, categories] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        community: true,
        category: true,
      }
    }),
    prisma.community.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  // 3. Graceful fallback: If the requested event does not exist, return to manager list
  if (!event) {
    redirect('/admin/events');
  }

  // Serialize complex Date objects to string tokens for client component hydration
  const serializedEvent = {
    ...event,
    eventDate: event.eventDate ? event.eventDate.toISOString().substring(0, 10) : '',
    registrationDeadline: event.registrationDeadline ? event.registrationDeadline.toISOString().substring(0, 10) : '',
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };

  return (
    <EditEventClient 
      session={session} 
      event={serializedEvent} 
      communities={communities} 
      categories={categories} 
    />
  );
}
