import express from "express"
import { stripeWebhookController } from "../controllers/stripe-webhook-controller"

const router = express.Router()

router.post(
  "/api/payments/stripe-webhook",
  stripeWebhookController
)

export { router as stripeWebhookRouter }