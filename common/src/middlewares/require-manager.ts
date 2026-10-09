import type { Request, Response, NextFunction } from "express"
import { ForbiddenError } from "../errors/forbidden-error"
import { UserRole } from "./current-user"

// middleware to check if req.currentUser exists
// use when an action require user authentication
export const requireManager = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.currentUser!.role != UserRole.Manager)
    throw new ForbiddenError()

  next()
}