import React from 'react';
import HomeClient from './HomeClient';
import { getCommunities } from '@/services/communityService';
import { getFeaturedEvents } from '@/services/eventService';

// Force dynamic rendering to ensure the database counts and dates are always fresh
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch communities and featured events in parallel on the server
  const [communities, featuredEvents] = await Promise.all([
    getCommunities(),
    getFeaturedEvents()
  ]);

  return (
    <HomeClient 
      initialCommunities={communities} 
      initialFeaturedEvents={featuredEvents} 
    />
  );
}
