import { Request, Response } from "express"
import { signin } from "../services/signin-service"
import { UserRole } from "@mint1312-flight-booking/common"

type ReqBody = {
  email: string,
  password: string,
  role: UserRole
}

export const signinController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const { email, password, role } = req.body

  const { userJWT, existingUser } = await signin(email, password, role)

  req.session = { jwt: userJWT }

  res.status(200).send(existingUser)
}