import { Request, Response } from "express"
import { resendOtp } from "../services/resend-otp-service"

type ReqBody = {
  email: string
}

export const resendOtpController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const { email } = req.body

  await resendOtp(email)

  res.send({ message: "Your OTP has been sent" })
}