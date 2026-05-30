/**
 * Helper to determine the absolute base URL when executing on the server,
 * or relative URL when executing on the client.
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''; // Client-side relative path
  }
  const port = process.env.PORT || '3000';
  return process.env.NEXT_PUBLIC_API_URL || `http://localhost:${port}`;
};

/**
 * Fetches upcoming events with community details, sorted by nearest date first.
 * Supports flexible filter query options.
 * 
 * @param {Object} filters - Optional query parameters
 * @param {string} filters.category - Filter by event category
 * @param {boolean} filters.featured - Filter by featured status
 * @param {string} filters.community - Filter by community slug
 * @returns {Promise<Array>} List of filtered upcoming events
 */
export async function getUpcomingEvents(filters = {}) {
  try {
    const baseUrl = getBaseUrl();
    const url = new URL(`${baseUrl}/api/events`);

    // Dynamically append query parameters if present
    if (filters.category) {
      url.searchParams.append('category', filters.category);
    }
    if (filters.featured !== undefined && filters.featured !== null) {
      url.searchParams.append('featured', String(filters.featured));
    }
    if (filters.community) {
      url.searchParams.append('community', filters.community);
    }

    const res = await fetch(url.toString(), {
      next: { 
        revalidate: 30 // Revalidate event listings every 30 seconds
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch events: status ${res.status}`);
    }

    const payload = await res.json();
    if (!payload.success) {
      throw new Error(payload.message || "Endpoint returned an unsuccessful status");
    }

    return payload.data || [];
  } catch (error) {
    console.error("Error in eventService -> getUpcomingEvents:", error);
    return []; // Production-safe fallback to prevent total page crash
  }
}

/**
 * Retrieves only featured upcoming events.
 * 
 * @returns {Promise<Array>} List of featured upcoming events
 */
export async function getFeaturedEvents() {
  return getUpcomingEvents({ featured: true });
}

/**
 * Retrieves upcoming events hosted by a specific community.
 * 
 * @param {string} communitySlug - The unique slug of the community (e.g. 'awaken-run')
 * @returns {Promise<Array>} List of events hosted by the specified community
 */
export async function getEventsByCommunity(communitySlug) {
  if (!communitySlug) return [];
  return getUpcomingEvents({ community: communitySlug });
}
