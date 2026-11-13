import express from "express"
import { body } from "express-validator"
import { requireAuth, validateRequest } from "@mint1312-flight-booking/common"
import { confirmStripePaymentController } from "../controllers/confirm-stripe-payment-controller"

const router = express.Router()

router.post(
  "/api/payments/confirm-stripe-payment",
  requireAuth,
  [
    body("paymentIntentId")
      .not()
      .isEmpty()
      .withMessage("Payment Intent ID is required"),
  ],
  validateRequest,
  confirmStripePaymentController
)

export { router as confirmStripePaymentRouter }