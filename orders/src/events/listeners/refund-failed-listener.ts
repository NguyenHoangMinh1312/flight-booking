import { JsMsg } from "nats"
import { Subjects, Listener, RefundFailedEvent, OrderStatus } from "@mint1312-flight-booking/common"
import { Order } from "../../models/order"
import { queueGroupName } from "./queue-group-name"
import mongoose from "mongoose"
import { OrderRefundFailedPublisher } from "../publishers/order-refund-failed-publisher"

export class RefundFailedListener extends Listener<RefundFailedEvent> {
  readonly subject = Subjects.RefundFailed
  queueGroupName = queueGroupName

  async onMessage(data: RefundFailedEvent["data"], msg: JsMsg) {
    // change the order status to canceled
    const order = await Order.findById(data.orderId).populate("ticket")

    if (!order)
      throw new Error("Order not found")

    if (order.status === OrderStatus.RefundFailed)
      return msg.ack()

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // update order status
      order.set({ status: OrderStatus.RefundFailed })
      await order.save({ session })

      // save the event to outbox
      const outboxEvent = OrderRefundFailedPublisher.buildOutboxEvent({
        id: order.id,
        version: order.version
      })
      await outboxEvent.save({ session })

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