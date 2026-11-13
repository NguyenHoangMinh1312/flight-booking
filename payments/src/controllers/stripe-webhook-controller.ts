import { Request, Response } from "express";
import { stripeClient } from "../services/payment-clients/stripe-client";
import { confirmPayment } from "../services/confirm-payment-service";
import { PaymentProvider } from "../models/payment";

export const stripeWebhookController = async (
  req: Request,
  res: Response
) => {
  // extract stripe signature
  const sig = req.headers["stripe-signature"]

  if (!sig)
    return res.status(400).send({ error: "Missing stripe-signature header" })

  const event = stripeClient.constructEvent(req.body, sig)

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata?.orderId
    const userId = paymentIntent.metadata?.userId

    if (!orderId) {
      console.log(`PaymentIntent ${paymentIntent.id} missing orderId in metadata`)
      return res.send({ received: true })
    }

    if (!userId) {
      console.log(`PaymentIntent ${paymentIntent.id} missing userId in metadata`)
      return res.send({ received: true })
    }

    // save the payment info
    await confirmPayment(orderId, userId, paymentIntent.id, PaymentProvider.Stripe)
  }

  res.send({ received: true })
}
