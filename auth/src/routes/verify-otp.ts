import express, { Request, Response } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"
import { User } from "../models/user"
import { BadRequestError, validateRequest } from "@mint1312-flight-booking/common"
import { UserRole } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher"
import { Otp } from "../models/otp"

const router = express.Router()

router.post(
  "/api/users/verify-otp",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, otp } = req.body

    // find the otp record
    const otpRecord = await Otp.findOne({ email })

    // validation
    if (!otpRecord || otpRecord.expiresAt < new Date())
      throw new BadRequestError("Code has expired or invalid")

    if (otpRecord.attempts >= 10) {
      await Otp.deleteOne({ _id: otpRecord.id })
      throw new BadRequestError("Too many incorrect attempts. Please request a new code.")
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1
      await otpRecord.save()
      throw new BadRequestError("Invalid verfication code")
    }

    // find the unverified user
    const user = await User.findOne({ email })
    if (!user)
      throw new BadRequestError("User not found")

    if (user.isVerified)
      throw new BadRequestError("User is already verified")

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // Mark the user as verified
      user.set({ isVerified: true })
      await user.save({ session })

      // Clear the OTP
      await otpRecord.deleteOne({ _id: otpRecord.id })

      // save event to outbox
      const outboxEvent = UserCreatedPublisher.buildOutboxEvent({
        id: user.id,
        email: user.email
      })
      await outboxEvent.save({ session })

      // commit db transaction
      await session.commitTransaction()

      // generate JWT
      const userJWT = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: user.role === UserRole.Customer ? "1d" : "1h",
        }
      )

      // response 
      req.session = { jwt: userJWT }
      res.send(user)
    } catch (err) {
      await session.abortTransaction();
      console.log(err)
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
)

export { router as verifyOtpRouter }