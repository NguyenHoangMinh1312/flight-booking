import { Request, Response } from "express"
import { resendOtp } from "../services/resend-otp-service"

export const resendOtpController = async (req: Request, res: Response) => {
  const email = req.body

  await resendOtp(email)

  res.send({ message: "Your OTP has been sent" })
}