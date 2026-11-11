import express from "express"
import { requireAuth } from "@mint1312-flight-booking/common"
import { showByOrderController } from "../controllers/show-by-order-controller"

const router = express.Router()

router.get(
  "/api/payments/:orderId",
  requireAuth,
  showByOrderController
)

export { router as showByOrderRouter }
