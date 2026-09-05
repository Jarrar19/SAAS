import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Standard Zod validation middleware for request bodies.
 * Formats errors into the standardized API error structure:
 * {
 *   success: false,
 *   error: {
 *     code: "VALIDATION_ERROR",
 *     message: "...",
 *     details: [ { field: "price", issue: "..." } ]
 *   }
 * }
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError;
      const details = error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: details[0]?.issue || "Invalid request body.",
          details,
        },
      });
      return;
    }

    // Attach parsed, trimmed, and default-filled data back to req.body
    req.body = result.data;
    next();
  };
}
