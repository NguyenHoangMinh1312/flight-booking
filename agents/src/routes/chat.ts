import express from "express"
import { currentUser, requireAuth, validateRequest } from "@mint1312-flight-booking/common"
import { body } from "express-validator"
import { chatController } from "../controllers/chat-controller"

const router = express.Router()

router.post(
  "/api/agents/:chatSessionId",
  [
    body("userMessage")
      .trim()
      .notEmpty()
      .withMessage("You must supply the message content"),
    body("timezone")
      .trim()
      .notEmpty()
      .withMessage("You must supply your timezone")
      .custom((value) => {
        Intl.DateTimeFormat(undefined, { timeZone: value })
        return true
      })
      .withMessage("Invalid IANA timezone")
  ],
  validateRequest,
  currentUser,
  requireAuth,
  chatController
)

export { router as chatRouter }
