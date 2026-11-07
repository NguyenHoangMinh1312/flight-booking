import { requireAuth } from "@mint1312-flight-booking/common"
import express from "express"
import { showOrderController } from "../controllers/show-order-controller"

const router = express.Router()

router.get(
  "/api/orders/:orderId",
  requireAuth,
  showOrderController
)

export { router as showOrderRouter }