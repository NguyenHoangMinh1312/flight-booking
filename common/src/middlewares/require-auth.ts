import type { Request, Response, NextFunction } from "express"
import { UnauthorizedError } from "../errors/unauthorized-error"

// middleware to check if req.currentUser exists
// use when an action require user authentication
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser)
    throw new UnauthorizedError()

  next()
}