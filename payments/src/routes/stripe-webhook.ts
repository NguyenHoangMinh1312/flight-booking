import express, { Request, Response } from "express"
import Stripe from "stripe"
import { OrderStatus } from "@mint1312-flight-booking/common"
import { stripe } from "../stripe"
import { Order } from "../models/order"
import { Payment } from "../models/payment"
import mongoose from "mongoose"
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher"

const router = express.Router()

router.post(
  "/api/payments/stripe-webhook",
  async (req: Request, res: Response) => {
    // extract stripe signature
    const sig = req.headers["stripe-signature"]

    if (!sig)
      return res.status(400).send({ error: "Missing stripe-signature header" })

    // create a stripe event
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

      if (!orderId) {
        console.warn(`PaymentIntent ${paymentIntent.id} missing orderId in metadata`)
        return res.status(200).send({ received: true })
      }

      // avoid duplicate payment records 
      const existingPayment = await Payment.findOne({ stripeId: paymentIntent.id })
      if (existingPayment)
        return res.send({ received: true })

      const order = await Order.findById(orderId)

      if (!order)
        return res.status(404).send({ error: "Order not found" })

      // if the order is processed, ignore it
      if (order.status !== OrderStatus.Created)
        return res.send({ received: true })

      // db transaction
      const session = await mongoose.startSession()

      try {
        session.startTransaction()

        // Save payment
        const payment = Payment.build({
          orderId: order.id,
          stripeId: paymentIntent.id,
        })
        await payment.save({ session })

        // save event to outbox
        const outboxEvent = PaymentCreatedPublisher.buildOutboxEvent({
          id: payment.id,
          version: payment.version,
          orderId: payment.orderId,
          stripeId: payment.stripeId,
        })
        await outboxEvent.save({ session })

        // commit db transacrion
        await session.commitTransaction()

      } catch (err) {
        await session.abortTransaction();
        throw new Error("Something went wrong. Please try again")
      } finally {
        await session.endSession()
      }
    }

    // response to stripe
    res.send({ received: true })
  }
)

export { router as stripeWebhookRouter }