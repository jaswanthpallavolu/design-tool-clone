import { Request, Response, NextFunction } from "express"

/**
 * Global error handling middleware for Express
 * Catches all errors passed via next(error) and sends appropriate response
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err.stack)

  // Send error response
  res.status(500).json({
    error: err.message || "Internal Server Error",
  })
}

// Made with Bob
