import { PrismaClient } from './generated/client/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis;

/**
 * Creates and configures a PrismaClient instance with the MariaDB adapter.
 * 
 * KEY FIX: Pass a connection string (not a config object) to PrismaMariaDb.
 * The adapter factory internally:
 * 1. Rewrites mysql:// → mariadb:// protocol
 * 2. Creates a connection pool via mariadb.createPool()
 * 3. Runs capability detection (SELECT VERSION())
 * 
 * Passing a config object skips the URL rewrite and can cause SSL/pool issues
 * in serverless environments like Vercel.
 */
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  // Build the connection URL with proper SSL and pool settings
  const url = new URL(databaseUrl);

  // The mariadb driver needs mariadb:// protocol, not mysql://
  // The adapter does this automatically for string configs, but we
  // set it explicitly for clarity
  url.protocol = 'mariadb:';

  // Configure SSL for Aiven cloud database
  // rejectUnauthorized=false is required when no CA cert is provided
  url.searchParams.set('ssl[rejectUnauthorized]', 'false');

  // Serverless-optimized pool settings:
  // - Low connection limit prevents exhausting DB connections across
  //   multiple concurrent Vercel function instances
  // - Short acquire timeout fails fast instead of hanging for 10s
  url.searchParams.set('connectionLimit', '3');
  url.searchParams.set('acquireTimeout', '8000');

  // Required by the adapter to prevent prepared statement cache issues
  url.searchParams.set('prepareCacheLength', '0');

  const connectionString = url.toString();

  const adapter = new PrismaMariaDb(connectionString);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

// Singleton pattern: cache globally in ALL environments to prevent
// connection exhaustion in Vercel serverless warm invocations.
// Using __prisma to avoid naming collisions with other globals.
const prisma = globalForPrisma.__prisma || createPrismaClient();

// Cache in both development AND production.
// In development: prevents HMR from creating new clients on every reload.
// In production: reuses the client across warm invocations of the same
// serverless function instance.
globalForPrisma.__prisma = prisma;

export { prisma };
export default prisma;
