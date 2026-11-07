import { Otp } from "../models/otp"
import { BadRequestError, UserRole } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { User } from "../models/user"
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher"
import jwt from "jsonwebtoken"

export const verifyOtp = async (email: string, otp: string) => {
  // validate otp
  const otpRecord = await Otp.findOne({ email })

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

  // verify the user
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

    return { userJWT, user }
  } catch (err) {
    await session.abortTransaction();
    console.log(err)
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}