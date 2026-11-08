import { Request, Response } from "express"
import { signup } from "../services/signup-service"

type ReqBody = {
  email: string,
  password: string
}

export const signupController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const { email, password } = req.body

  await signup(email, password)

  res.send({ message: "A verification code is sent to your email" })
}