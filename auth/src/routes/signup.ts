import express from "express"
import { body } from "express-validator"
import { validateRequest } from "@mint1312-flight-booking/common"
import { signupController } from "../controllers/signup-controller"

const router = express.Router()

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
  signupController
)

export { router as signupRouter }