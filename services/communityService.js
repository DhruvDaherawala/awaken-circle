/**
 * Helper to determine the absolute base URL when executing on the server,
 * or relative URL when executing on the client.
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''; // Client-side relative path
  }
  // Try to use PORT from environment to match active next dev server dynamically
  const port = process.env.PORT || '3000';
  return process.env.NEXT_PUBLIC_API_URL || `http://localhost:${port}`;
};

/**
 * Fetches all communities from the API sorted alphabetically by name.
 * Utilizes Next.js ISR (Incremental Static Regeneration) cache settings.
 * 
 * @returns {Promise<Array>} Array of community objects with related event counts
 */
export async function getCommunities() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/communities`, {
      next: { 
        revalidate: 60 // Revalidate cache every 60 seconds
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch communities: status ${res.status}`);
    }

    const payload = await res.json();
    if (!payload.success) {
      throw new Error(payload.message || "Endpoint returned an unsuccessful status");
    }

    return payload.data || [];
  } catch (error) {
    console.error("Error in communityService -> getCommunities:", error);
    return []; // Production-safe fallback to prevent total page crash
  }
}
