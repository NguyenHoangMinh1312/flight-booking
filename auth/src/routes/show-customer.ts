import express from "express"
import { currentUser, requireAuth, requireManager } from "@mint1312-flight-booking/common"
import { showCustomerController } from "../controllers/show-customer-controller"

const router = express.Router()

router.get(
  "/api/users/:id",
  currentUser,
  requireAuth,
  requireManager,
  showCustomerController
)

export { router as showCustomerRouter }