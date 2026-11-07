import express from "express"
import { currentUser, requireAuth, requireManager } from "@mint1312-flight-booking/common"
import { showController } from "../controllers/show-controller"

const router = express.Router()

router.get(
  "/api/users/:id",
  currentUser,
  requireAuth,
  requireManager,
  showController
)

export { router as showUserRouter }