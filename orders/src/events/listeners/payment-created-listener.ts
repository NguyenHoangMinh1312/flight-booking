import { JsMsg } from "nats"
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from "@mint1312-flight-booking/common"
import { Order } from "../../models/order"
import { queueGroupName } from "./queue-group-name"
import mongoose from "mongoose"
import { OrderCompletePublisher } from "../publishers/order-complete-publisher"

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
  queueGroupName = queueGroupName

  async onMessage(data: PaymentCreatedEvent["data"], msg: JsMsg) {
    // change the order status to completed
    const order = await Order.findById(data.orderId).populate("ticket")

    if (!order)
      throw new Error("Order not found")

    if (order.status === OrderStatus.Complete)
      return msg.ack()

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // update order status
      order.set({ status: OrderStatus.Complete })
      await order.save({ session })

      // save the event to outbox
      const outboxEvent = OrderCompletePublisher.buildOutboxEvent({
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