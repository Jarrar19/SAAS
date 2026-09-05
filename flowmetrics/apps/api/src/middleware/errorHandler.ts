import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors.js";
import { config } from "../config/env.js";

/**
 * Global Error Handling Middleware:
 * Last safety net in Express pipeline ensuring:
 * 1. Consistent error response shape { success: false, error: { code, message, details } }
 * 2. Proper HTTP status mapping (400, 401, 403, 404, 409, 500)
 * 3. Mongoose CastError (invalid ObjectId) -> 400 INVALID_ID
 * 4. MongoServerError 11000 (duplicate key) -> 409 CONFLICT
 * 5. In production: zero internal error message or stack trace leaks
 * 6. Never lets an unhandled error crash the Node process
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const isProduction = (process.env.NODE_ENV || config.NODE_ENV) === "production";

  // 1. AppError (explicitly thrown custom errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // 2. Mongoose CastError (e.g. invalid ObjectId format like 'not-a-valid-id')
  if (err.name === "CastError") {
    const field = err.path || "id";
    const value = err.value;
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: `Invalid format for '${field}': '${value}'. Must be a valid MongoDB ObjectId.`,
        details: [
          {
            field,
            issue: `Cast to ObjectId failed for value '${value}'`,
          },
        ],
      },
    });
    return;
  }

  // 3. MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000 || err.name === "MongoServerError" && err.code === 11000) {
    const keyValue = err.keyValue || {};
    const field = Object.keys(keyValue)[0] || "field";
    const val = keyValue[field];

    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: `A record with ${field} '${val}' already exists.`,
        details: [
          {
            field,
            issue: `Duplicate value violation on unique field '${field}'`,
          },
        ],
      },
    });
    return;
  }

  // 4. Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    const details = Object.keys(err.errors || {}).map((key) => ({
      field: key,
      issue: err.errors[key].message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Database schema validation failed.",
        details,
      },
    });
    return;
  }

  // 5. JSON Syntax Error in request body (e.g. invalid JSON sent by client)
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON payload in request body.",
      },
    });
    return;
  }

  // 6. JWT Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: err.name === "TokenExpiredError" ? "Token has expired." : "Invalid authentication token.",
      },
    });
    return;
  }

  // 7. Fallback 500 Internal Server Error
  // Log full error internally on server console
  console.error("[Internal Server Error]", err);

  const statusCode = err.statusCode || 500;

  if (isProduction) {
    // In production: return safe generic message, NEVER leak internal error details or stack trace
    res.status(statusCode).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected internal server error occurred.",
      },
    });
  } else {
    // In development: expose message and stack trace to assist local debugging
    res.status(statusCode).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred.",
        details: [
          {
            field: "stack",
            issue: err.stack || "No stack trace available",
          },
        ],
      },
    });
  }
};

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Endpoint '${req.method} ${req.originalUrl}' does not exist.`,
    },
  });
}
