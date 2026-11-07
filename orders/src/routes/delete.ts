import { requireAuth, validateRequest, RefundReason } from "@mint1312-flight-booking/common"
import express from "express"
import { body } from "express-validator"
import { cancelOrderController } from "../controllers/cancel-order-controller"

const router = express.Router()

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  [
    body("refundReason")
      .isString()
      .isIn(Object.values(RefundReason))
      .withMessage("refundReason is invalid")
  ],
  validateRequest,
  cancelOrderController
)

export { router as deleteOrderRouter }