import { successResponse, errorResponse, withErrorHandler } from '@/lib/api';
import * as mariadb from 'mariadb';

/**
 * GET /api/test
 * Diagnostic endpoint to test the Prisma client and database connection pool.
 */
async function handler(request) {
  const dbUrlRaw = process.env.DATABASE_URL || '';
  const urlLen = dbUrlRaw.length;
  const urlStart = dbUrlRaw.substring(0, 15);
  const urlEnd = dbUrlRaw.substring(Math.max(0, urlLen - 15));
  
  let parseDiagnostics = {};
  let mariadbStatus = 'Not Checked';
  let mariadbError = null;
  let poolStatus = 'Not Checked';
  let poolError = null;

  try {
    if (!dbUrlRaw) {
      throw new Error("DATABASE_URL environment variable is empty or undefined");
    }

    const dbUrl = new URL(dbUrlRaw);
    parseDiagnostics = {
      protocol: dbUrl.protocol,
      host: dbUrl.hostname,
      port: dbUrl.port,
      username: dbUrl.username,
      database: dbUrl.pathname.replace(/^\//, ''),
      searchParams: dbUrl.search
    };

    // Try a direct connection using the native mariadb driver to bypass Prisma pool
    const connOptions = {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '3306', 10),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ''),
      connectTimeout: 5000, // Short timeout to fail fast
      ssl: {
        rejectUnauthorized: false
      }
    };

    const conn = await mariadb.createConnection(connOptions);
    await conn.query("SELECT 1");
    mariadbStatus = 'Connected successfully using native mariadb createConnection';
    await conn.end();

    // Now try creating a pool and getting a connection from it
    try {
      const pool = mariadb.createPool({
        ...connOptions,
        connectionLimit: 3,
        acquireTimeout: 5000
      });
      const poolConn = await pool.getConnection();
      await poolConn.query("SELECT 1");
      poolStatus = 'Connected successfully using native mariadb createPool';
      poolConn.release();
      await pool.end();
    } catch (pErr) {
      poolStatus = 'Failed to connect using native mariadb createPool';
      poolError = {
        message: pErr.message,
        code: pErr.code,
        errno: pErr.errno,
        syscall: pErr.syscall
      };
    }
  } catch (err) {
    mariadbStatus = 'Failed to connect using native mariadb createConnection';
    mariadbError = {
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      stack: err.stack
    };
  }

  const responseData = {
    env: {
      urlLen,
      urlStart,
      urlEnd,
      nodeEnv: process.env.NODE_ENV
    },
    parseDiagnostics,
    mariadbStatus,
    mariadbError,
    poolStatus,
    poolError
  };


  if (mariadbError) {
    return errorResponse(
      "Database connection check failed.",
      503,
      responseData
    );
  }

  return successResponse(
    responseData,
    "Database connection checked and is healthy."
  );
}

// Export the GET method wrapped in our centralized, resilient error handler
export const GET = withErrorHandler(handler);

