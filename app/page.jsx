import React from 'react';
import HomeClient from './HomeClient';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

/**
 * Cached data fetcher for homepage communities.
 * Revalidates every 60 seconds instead of being force-dynamic.
 * Direct Prisma call eliminates the wasteful self-fetch HTTP round-trip
 * that the old service layer was doing (server → fetch → own API route → Prisma).
 */
const getCachedCommunities = unstable_cache(
  async () => {
    return prisma.community.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        coverImage: true,
        themeColor: true,
        logo: true,
        _count: {
          select: { events: true },
        },
      },
    });
  },
  ['homepage-communities'],
  { revalidate: 60 }
);

/**
 * Cached data fetcher for homepage featured events.
 * Only fetches PUBLISHED, future, featured events with minimal fields.
 */
const getCachedFeaturedEvents = unstable_cache(
  async () => {
    return prisma.event.findMany({
      where: {
        featured: true,
        status: 'PUBLISHED',
        eventDate: { gte: new Date() },
      },
      orderBy: { eventDate: 'asc' },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        eventDate: true,
        eventTime: true,
        endTime: true,
        location: true,
        coverImage: true,
        price: true,
        category: {
          select: { name: true },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            themeColor: true,
            logo: true,
          },
        },
      },
    });
  },
  ['homepage-featured-events'],
  { revalidate: 30 }
);

// Use ISR instead of force-dynamic — page regenerates automatically
export const revalidate = 30;

export default async function Home() {
  // Fetch communities and featured events in parallel on the server
  // Direct Prisma queries (no self-fetch) — eliminates ~200-500ms of HTTP overhead
  const [communities, featuredEvents] = await Promise.all([
    getCachedCommunities(),
    getCachedFeaturedEvents()
  ]);

  return (
    <HomeClient 
      initialCommunities={communities} 
      initialFeaturedEvents={featuredEvents} 
    />
  );
}
