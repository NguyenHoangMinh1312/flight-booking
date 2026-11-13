import { OrderStatus } from "@mint1312-flight-booking/common"
import { Order } from "../models/order"
import { Payment, PaymentProvider } from "../models/payment"
import mongoose from "mongoose"
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher"

export const confirmPayment = async (
  orderId: string,
  userId: string,
  transactionId: string,
  provider: PaymentProvider
) => {
  // check if payment is processed
  const existingPayment = await Payment.findOne({ transactionId })
  if (existingPayment)
    return null

  const order = await Order.findById(orderId)
  if (!order || order.status !== OrderStatus.Created || order.userId !== userId)
    return null

  // save the payment info
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // Save payment
    const payment = Payment.build({
      order,
      provider,
      transactionId
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