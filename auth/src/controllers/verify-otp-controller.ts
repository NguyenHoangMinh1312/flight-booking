import { Request, Response } from "express"
import { verifyOtp } from "../services/verify-otp-service"
import { BadRequestError } from "@mint1312-flight-booking/common"

export const verifyOtpController = async (
  req: Request,
  res: Response
) => {
  const { email, otp } = req.body

  if (typeof email !== "string")
    throw new BadRequestError("Invalid email")

  if (typeof otp !== "string")
    throw new BadRequestError("Invalid otp")

  const { userJWT, user } = await verifyOtp(email, otp)

  req.session = { jwt: userJWT }
  res.send(user)
}
