import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EventsManagerClient from './EventsManagerClient';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/events
 * Admin events dashboard. Performs secure server-side session checks 
 * and handles the layout wrapper transitions.
 */
export default async function AdminEventsPage() {
  // Fetch active admin session on the server
  const session = await getServerSession(authOptions);

  // Safeguard: if session is missing, redirect securely to login
  if (!session) {
    redirect('/admin/login');
  }

  return <EventsManagerClient session={session} />;
}
