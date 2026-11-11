import express from "express"
import { body } from "express-validator"
import { requireAuth, validateRequest } from "@mint1312-flight-booking/common"
import { createPaymentController } from "../controllers/create-payment-controller"

const router = express.Router()

router.post(
  "/api/payments",
  requireAuth,
  [
    body("orderId")
      .not()
      .isEmpty()
      .withMessage("OrderId is required"),
  ],
  validateRequest,
  createPaymentController
)

export { router as createPaymentRouter }
