import express from "express"
import { body } from "express-validator"
import { validateRequest } from "@mint1312-flight-booking/common"
import { resendOtpController } from "../controllers/resend-otp-controller"

const router = express.Router()

router.post(
  "/api/users/resend-otp",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
  ],
  validateRequest,
  resendOtpController
)

export { router as resendOtpRouter }