import { JsMsg } from "nats"
import { Subjects, Listener, RefundCompleteEvent, OrderStatus } from "@mint1312-flight-booking/common"
import { Order } from "../../models/order"
import { queueGroupName } from "./queue-group-name"
import mongoose from "mongoose"
import { OrderCanceledPublisher } from "../publishers/order-canceled-publisher"

export class RefundCompleteListener extends Listener<RefundCompleteEvent> {
  readonly subject = Subjects.RefundComplete
  queueGroupName = queueGroupName

  async onMessage(data: RefundCompleteEvent["data"], msg: JsMsg) {
    // change the order status to canceled
    const order = await Order.findById(data.orderId).populate("ticket")

    if (!order)
      throw new Error("Order not found")

    if (order.status === OrderStatus.Canceled)
      return msg.ack()

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // update order status
      order.set({ status: OrderStatus.Canceled })
      await order.save({ session })

      // save the event to outbox
      const outboxEvent = OrderCanceledPublisher.buildOutboxEvent({
        id: order.id,
        version: order.version,
        ticket: {
          id: order.ticket.id
        },
        userId: order.userId
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