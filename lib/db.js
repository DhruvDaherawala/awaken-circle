import prisma from './prisma';

/**
 * Database health check utility.
 * Attemps to execute a lightweight raw SELECT query to verify connection status.
 */
export async function connectDB() {
  try {
    // Standard connection check
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: "Database connection established successfully."
    };
  } catch (error) {
    console.error("Database connection diagnostic error details:");
    console.dir(error, { depth: null });
    return {
      connected: false,
      message: "Failed to connect to the database.",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
