import { Request, Response, NextFunction } from "express"

/**
 * Wraps async route handlers to catch errors and pass them to Express error middleware
 * @param fn - Async route handler function
 * @returns Express middleware function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Made with Bob
