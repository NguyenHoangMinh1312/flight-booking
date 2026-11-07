import { UserRole, BadRequestError } from "@mint1312-flight-booking/common";
import { User } from "../models/user";
import { Password } from "../utils/password"
import jwt from "jsonwebtoken";

export const signin = async (
  email: string,
  password: string,
  role: UserRole
) => {
  // check if email exists and verified
  const existingUser = await User.findOne({ email, role })
  if (!existingUser)
    throw new BadRequestError("Invalid credentials")

  if (!existingUser.isVerified)
    throw new BadRequestError("Please verify your email before signing in")

  // compare passwords
  const passwordMatch = await Password.compare(existingUser.password, password)
  if (!passwordMatch)
    throw new BadRequestError("Invalid credentials")

  // generate JWT
  const userJWT = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role
    },
    process.env.JWT_KEY!,
    {
      expiresIn: existingUser.role === UserRole.Customer ? "1d" : "1h"
    }
  )

  return { userJWT, existingUser }
} 