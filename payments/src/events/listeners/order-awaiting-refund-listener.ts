import { Listener, OrderAwaitingRefundEvent, Subjects, OrderStatus } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { Order } from "../../models/order"
import { Payment } from "../../models/payment"
import mongoose from "mongoose"
import { refundQueue } from "../../queues/refund-queue"

export class OrderAwaitingRefundListener extends Listener<OrderAwaitingRefundEvent> {
  readonly subject = Subjects.OrderAwaitingRefund
  queueGroupName = queueGroupName

  async onMessage(data: OrderAwaitingRefundEvent["data"], msg: JsMsg) {
    // find the order
    const order = await Order.findById(data.id)

    if (!order)
      throw Error("Order not found")

    if (order.version >= data.version)
      return msg.ack()

    if (order.version !== data.version - 1)
      throw new Error("Out of order event received")

    // find the payment
    const payment = await Payment.findOne({ orderId: order.id })
    if (!payment)
      throw Error("Payment not found")

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // update the order
      order.set({
        version: data.version,
        status: OrderStatus.AwaitingRefund
      })
      await order.save({ session })

      // send the refund request to queue
      refundQueue.add({
        orderId: order.id,
        stripeId: payment.stripeId
      })

      // commit db transaction
      await session.commitTransaction()

      msg.ack()
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
}