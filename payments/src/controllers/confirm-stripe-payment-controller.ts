import { Request, Response } from "express";
import { stripeClient } from "../services/payment-clients/stripe-client";
import { confirmPayment } from "../services/confirm-payment-service";
import { PaymentProvider } from "../models/payment";
import { UnauthorizedError } from "@mint1312-flight-booking/common";

type ReqBody = {
  paymentIntentId: string
}

export const confirmStripePaymentController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const { paymentIntentId } = req.body
  const userId = req.currentUser?.id

  const paymentIntent = await stripeClient.retrievePaymentIntent(paymentIntentId)

  if (paymentIntent.status === "succeeded") {
    const orderId = paymentIntent.metadata?.orderId

    if (!orderId) {
      console.log(`PaymentIntent ${paymentIntent.id} missing orderId in metadata`)
      return res.send({ received: true })
    }

    if (!paymentIntent.metadata?.userId) {
      console.log(`PaymentIntent ${paymentIntent.id} missing userId in metadata`)
      return res.send({ received: true })
    }

    if (userId !== paymentIntent.metadata?.userId)
      throw new UnauthorizedError()

    // save the payment info
    await confirmPayment(orderId, userId, paymentIntent.id, PaymentProvider.Stripe)
  }

  res.send({ received: true })
}
