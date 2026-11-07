import { Request, Response } from "express"
import { signin } from "../services/signin-service"
import { BadRequestError, UserRole } from "@mint1312-flight-booking/common"

export const signinController = async (req: Request, res: Response) => {
  const { email, password, role } = req.body

  if (typeof email !== "string")
    throw new BadRequestError("Invalid email")

  if (typeof password !== "string")
    throw new BadRequestError("Invalid password")

  if (!Object.values(UserRole).includes(role as UserRole))
    throw new BadRequestError("Invalid user role")

  const { userJWT, existingUser } = await signin(email, password, role)

  req.session = { jwt: userJWT }

  res.status(200).send(existingUser)
}