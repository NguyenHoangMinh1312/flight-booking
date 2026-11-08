import { Request, Response } from "express"
import { verifyOtp } from "../services/verify-otp-service"

type ReqBody = {
  email: string,
  otp: string,
}

export const verifyOtpController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const { email, otp } = req.body

  const { userJWT, user } = await verifyOtp(email, otp)

  req.session = { jwt: userJWT }
  res.send(user)
}
