import express, { Request, Response } from "express"
import { body } from "express-validator"
import { User } from "../models/user"
import { BadRequestError, validateRequest } from "@mint1312-flight-booking/common"
import { Otp } from "../models/otp"
import { UserOtpRequestedPublisher } from "../events/publishers/user-otp-requested-publisher"
import mongoose from "mongoose"

const router = express.Router()

const RESEND_OTP_WINDOW = 60 * 1000   // allow to resend after 1 min from last sent

router.post(
  "/api/users/resend-otp",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body

    // find the otp record
    const otpRecord = await Otp.findOne({ email })

    // otp validation
    if (!otpRecord || otpRecord.expiresAt < new Date())
      throw new BadRequestError("Your OTP has expired or invalid")

    if (otpRecord.lastSentAt.getTime() + RESEND_OTP_WINDOW > Date.now())
      throw new BadRequestError("Please wait for 1 miniute between each OTP sent")

    // find and validate the user
    const user = await User.findOne({ email })
    if (!user)
      throw new BadRequestError("User not found")

    if (user.isVerified)
      throw new BadRequestError("User is already verified")

    // db session
    const session = await mongoose.startSession()

    try {
      session.startTransaction()
      // update the last sent time for otp
      otpRecord.lastSentAt = new Date()
      await otpRecord.save({ session })

      const outboxEvent = UserOtpRequestedPublisher.buildOutboxEvent({
        email: user.email,
        otp: otpRecord.otp
      })
      await outboxEvent.save({ session })
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }

    res.send({ message: "Your OTP has been sent" })
  }
)

export { router as resendOtpRouter }