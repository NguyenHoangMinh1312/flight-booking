import { Request, Response } from "express"
import { signup } from "../services/signup-service"
import { BadRequestError } from "@mint1312-flight-booking/common"

export const signupController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (typeof email !== "string")
    throw new BadRequestError("Invalid email")

  if (typeof password !== "string")
    throw new BadRequestError("Invalid password")

  await signup(email, password)

  res.send({ message: "A verification code is sent to your email" })
}