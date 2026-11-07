import { User } from "../models/user"
import { BadRequestError, UserRole } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Otp } from "../models/otp"
import { randomInt } from "crypto"
import { UserOtpRequestedPublisher } from "../events/publishers/user-otp-requested-publisher"

const OTP_EXPIRATION_WINDOW = 5 * 60 * 1000   // OTP expires after 5 mins

export const signup = async (
  email: string,
  password: string
) => {
  // check if user email exists
  const existingUser = await User.findOne({ email, role: UserRole.Customer })
  if (existingUser && existingUser.isVerified)
    throw new BadRequestError("Email in use")

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
      expiresAt: new Date(Date.now() + OTP_EXPIRATION_WINDOW),
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

  } catch (err) {
    await session.abortTransaction();
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}