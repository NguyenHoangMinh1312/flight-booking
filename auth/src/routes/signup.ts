import express, { Request, Response } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"
import { User } from "../models/user"
import { BadRequestError, validateRequest } from "@mint1312-flight-booking/common"
import { UserRole } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher"
import { randomInt } from "crypto"
import { Otp } from "../models/otp"
import { UserOtpRequestedPublisher } from "../events/publishers/user-otp-requested-publisher"

const router = express.Router()
const otpExpirationWindow = 5 * 60 * 1000   // OTP expires after 5 mins

router.post(
  "/api/users/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    // check if user email exists
    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.isVerified) {
      throw new BadRequestError("Email in use")
    }

    // db session
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // save user to db
      if (!existingUser) {
        const user = User.build({
          email,
          password,
          role: UserRole.Customer,
          isVerified: false
        })

        await user.save({ session })
      } else {
        existingUser.password = password
        await existingUser.save({ session })
      }

      // Remove previos OTPs
      await Otp.deleteMany({ email }).session(session)

      // Save the otp
      const otpDoc = Otp.build({
        email,
        otp: randomInt(100000, 999999).toString(),
        expiresAt: new Date(Date.now() + otpExpirationWindow),
        lastSentAt: new Date()
      })
      await otpDoc.save({ session })

      // save the event to outbox
      const outboxEvent = UserOtpRequestedPublisher.buildOutboxEvent({
        email,
        otp: otpDoc.otp
      })
      await outboxEvent.save({ session })

      // commit db transaction
      await session.commitTransaction()

      res.status(200).send({ message: "A verification code is sent to your email" })
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
)

export { router as signupRouter }