import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = global;

/**
 * Creates and configures a PrismaClient instance with the MariaDB adapter.
 */
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  // Parse connection string natively to build robust pool options with SSL
  console.log("Parsing DATABASE_URL: ", "Defined");
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  const poolOptions = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ''),
    ssl: {
      rejectUnauthorized: false // Required for secure connections to cloud providers like Aiven
    },
    connectionLimit: 10
  };
  
  console.log("MariaDB Pool Options parsed: ", {
    host: poolOptions.host,
    port: poolOptions.port,
    user: poolOptions.user,
    database: poolOptions.database,
    sslEnabled: !!poolOptions.ssl
  });

  const adapter = new PrismaMariaDb(poolOptions);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Ensure a single instance in development to prevent connection exhaustion
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
