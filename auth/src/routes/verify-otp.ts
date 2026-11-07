import express from "express"
import { body } from "express-validator"
import { validateRequest } from "@mint1312-flight-booking/common"
import { verifyOtpController } from "../controllers/verify-otp-controller"

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
  verifyOtpController
)

export { router as verifyOtpRouter }