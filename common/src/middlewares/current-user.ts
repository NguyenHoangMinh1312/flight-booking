import type { Request, Response, NextFunction } from "express"
import "cookie-session"
import jwt from "jsonwebtoken"

export enum UserRole {
  Manager = "manager",
  Customer = "customer"
}

interface UserPayload {
  id: string,
  email: string,
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

// middleware to extract the jwt token from user request and save to req.currentUser
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt)
    return next()

  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload
    req.currentUser = payload
  } catch (err) { }

  next()
}
