import { Prisma } from './generated/client/client';

/**
 * Creates a standard JSON success response.
 * 
 * @param {any} data - Payload data to return
 * @param {string} message - User-friendly message
 * @param {number} status - HTTP status code (default 200)
 */
export function successResponse(data, message = "Success", status = 200) {
  return Response.json({
    success: true,
    message,
    data
  }, { status });
}

/**
 * Creates a standard JSON error response.
 * 
 * @param {string} message - User-friendly error message
 * @param {number} status - HTTP status code (default 500)
 * @param {any} errors - Detailed validation or system errors
 */
export function errorResponse(message = "An error occurred", status = 500, errors = null) {
  return Response.json({
    success: false,
    message,
    errors
  }, { status });
}

/**
 * High-order API wrapper that provides robust, centralized try-catch and 
 * error classification for Next.js 15 App Router API Handlers.
 * 
 * @param {Function} handler - The Next.js API handler function
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("API Gateway Exception:", error);

      // Handle Prisma Database Engine Known Request Errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': {
            // Unique constraint violation (e.g. duplicate email or slug)
            const fields = error.meta?.target || 'fields';
            return errorResponse(
              `A resource conflict occurred: a record with the same ${fields} already exists.`,
              409,
              error.meta
            );
          }
          case 'P2025': {
            // Record not found
            return errorResponse(
              "The requested resource does not exist or has been deleted.",
              404
            );
          }
          case 'P2003': {
            // Foreign key failure
            return errorResponse(
              "Foreign key validation failed. Please check referenced entity IDs.",
              400,
              error.meta
            );
          }
          default:
            return errorResponse(
              `Database Operation Error [${error.code}]`,
              400,
              error.message
            );
        }
      }

      // Handle Prisma Validation Errors (e.g. incorrect field types passed to prisma client)
      if (error instanceof Prisma.PrismaClientValidationError) {
        return errorResponse(
          "Invalid payload format or missing required database parameters.",
          400,
          error.message
        );
      }

      // Handle custom or standard Javascript errors
      const errorMessage = error instanceof Error ? error.message : "Internal System Error";
      return errorResponse(errorMessage, 500);
    }
  };
}
