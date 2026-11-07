import { Request, Response } from "express"
import { signin } from "../services/signin-service"

export const signinController = async (req: Request, res: Response) => {
  const { email, password, role } = req.body

  const { userJWT, existingUser } = await signin(email, password, role)

  req.session = { jwt: userJWT }

  res.status(200).send(existingUser)
}