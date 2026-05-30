import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import { connectDB } from '@/lib/db';

/**
 * GET /api/test
 * Diagnostic endpoint to test the Prisma client and database connection pool.
 */
async function handler(request) {
  // Execute a lightweight raw connection check using the MariaDB driver adapter
  const dbStatus = await connectDB();

  if (!dbStatus.connected) {
    // 503 Service Unavailable: Database is down or credentials failed
    return errorResponse(
      dbStatus.message,
      503,
      { details: dbStatus.error } // Provides debugging context in response payload
    );
  }

  // Return a safe JSON payload indicating system health
  return successResponse(
    { 
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    "Database connection is successful and active."
  );
}

// Export the GET method wrapped in our centralized, resilient error handler
export const GET = withErrorHandler(handler);
