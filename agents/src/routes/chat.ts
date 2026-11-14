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
      .withMessage("You must supply the message content")
  ],
  validateRequest,
  currentUser,
  requireAuth,
  chatController
)

export { router as chatRouter }