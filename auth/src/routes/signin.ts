import express, { Request, Response } from "express"
import { body } from "express-validator"
import jwt from "jsonwebtoken"
import { User } from "../models/user"
import { validateRequest, BadRequestError } from "@mint1312-flight-booking/common"
import { Password } from "../utils/password"
import { UserRole } from "@mint1312-flight-booking/common"

const router = express.Router()

router.post(
  "/api/users/signin",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
    body("role")
      .trim()
      .isString()
      .isIn(Object.values(UserRole))
      .withMessage("Invalid user role")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, role } = req.body

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
        expiresIn: existingUser.role === UserRole.Customer ? "1d" : "1h",

      }
    )

    // store in cookies
    req.session = { jwt: userJWT }

    res.status(200).send(existingUser)
  })

export { router as signinRouter }