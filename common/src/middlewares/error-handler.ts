import type { Request, Response, NextFunction } from "express"
import { CustomError } from "../errors/custom-error"

// central error handling for auth service
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() })
  }

  console.error(err)

  res.status(400).send({ errors: [{ message: "Something went wrong" }] })
}