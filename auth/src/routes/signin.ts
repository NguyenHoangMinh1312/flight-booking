import express from "express"
import { body } from "express-validator"
import { validateRequest } from "@mint1312-flight-booking/common"
import { UserRole } from "@mint1312-flight-booking/common"
import { signinController } from "../controllers/signin-controller"

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
  signinController
)

export { router as signinRouter }