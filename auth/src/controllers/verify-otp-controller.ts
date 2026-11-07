import { Request, Response } from "express"
import { verifyOtp } from "../services/verify-otp-service"

export const verifyOtpController = async (
  req: Request,
  res: Response
) => {
  const { email, otp } = req.body

  const { userJWT, user } = await verifyOtp(email, otp)

  req.session = { jwt: userJWT }
  res.send(user)
}
