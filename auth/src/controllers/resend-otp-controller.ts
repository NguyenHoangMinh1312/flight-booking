import { Request, Response } from "express"
import { resendOtp } from "../services/resend-otp-service"
import { BadRequestError } from "@mint1312-flight-booking/common"

export const resendOtpController = async (req: Request, res: Response) => {
  const email = req.body

  if (typeof email !== "string")
    throw new BadRequestError("Invalid email")

  await resendOtp(email)

  res.send({ message: "Your OTP has been sent" })
}