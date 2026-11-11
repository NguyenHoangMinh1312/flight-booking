import { Event } from "stripe";
import { Payment, PaymentProvider } from "../models/payment";
import { Order } from "../models/order";
import { OrderStatus } from "@mint1312-flight-booking/common";
import mongoose from "mongoose";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";

export const handleStripeWebhook = async (
  event: Event
) => {
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata?.orderId

    if (!orderId) {
      console.warn(`PaymentIntent ${paymentIntent.id} missing orderId in metadata`)
      return { status: 200, error: undefined }
    }

    // avoid duplicate payment records 
    const existingPayment = await Payment.findOne({ transactionId: paymentIntent.id })
    if (existingPayment)
      return { status: 200, error: undefined }

    // check if order exists
    const order = await Order.findById(orderId)
    if (!order)
      return { status: 404, error: "Order not found" }

    // if the order is processed, ignore it
    if (order.status !== OrderStatus.Created)
      return { status: 200, error: undefined }

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // Save payment
      const payment = Payment.build({
        order,
        provider: PaymentProvider.Stripe,
        transactionId: paymentIntent.id,
      })
      await payment.save({ session })

      // save event to outbox
      const outboxEvent = PaymentCreatedPublisher.buildOutboxEvent({
        id: payment.id,
        version: payment.version,
        orderId
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

  // response to stripe for others connections
  return { status: 200, error: undefined }
}