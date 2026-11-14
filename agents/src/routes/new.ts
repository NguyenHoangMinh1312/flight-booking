import express from "express"
import { currentUser, requireAuth } from "@mint1312-flight-booking/common"
import { createChatController } from "../controllers/create-chat-controller"

const router = express.Router()

router.post(
  "/api/agents/",
  currentUser,
  requireAuth,
  createChatController
)

export { router as createChatSessionRouter }