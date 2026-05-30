import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateEventClient from './CreateEventClient';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/events/create
 * Server component gate for administrative event creation.
 */
export default async function AdminEventCreatePage() {
  // Fetch session on the server
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login
  if (!session) {
    redirect('/admin/login');
  }

  return <CreateEventClient session={session} />;
}
