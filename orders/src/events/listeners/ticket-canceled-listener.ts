import { JsMsg } from "nats"
import { Subjects, Listener, TicketCanceledEvent, FlightStatus, OrderStatus } from "@mint1312-flight-booking/common"
import { Ticket } from "../../models/ticket"
import { Order } from "../../models/order"
import { queueGroupName } from "./queue-group-name"
import mongoose from "mongoose"
import { OrderCanceledPublisher } from "../publishers/order-canceled-publisher"
import { OrderAwaitingRefundPublisher } from "../publishers/order-awaiting-refund-publisher"

export class TicketCanceledListener extends Listener<TicketCanceledEvent> {
  readonly subject = Subjects.TicketCanceled
  queueGroupName = queueGroupName

  async onMessage(data: TicketCanceledEvent["data"], msg: JsMsg) {
    // find the previous ticket version
    const ticket = await Ticket.findById(data.id)

    if (!ticket)
      throw new Error("Ticket not found")

    if (ticket.version >= data.version)
      return msg.ack()

    if (ticket.version !== data.version - 1)
      throw new Error("Out of order event received")

    // find the orders associated with the ticket
    const orders = await Order.find({ ticket: data.id })

    // db session
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // update the ticket
      ticket.set({
        status: FlightStatus.Canceled,
        version: data.version
      })
      await ticket.save({ session })

      if (!orders) {
        await session.commitTransaction()
        return msg.ack()
      }

      // process the order
      const outboxEvents = []
      for (let order of orders) {
        // if the order is just created (unpaid)
        if (order.status === OrderStatus.Created) {
          order.set({ status: OrderStatus.Canceled })
          await order.save({ session })

          outboxEvents.push(
            OrderCanceledPublisher.buildOutboxEvent({
              id: order.id,
              version: order.version,
              ticket: {
                id: ticket.id
              },
              userId: order.userId
            })
          )
          continue
        }

        // if the order is paid
        if ([OrderStatus.Complete, OrderStatus.RefundFailed].includes(order.status)) {
          order.set({ status: OrderStatus.AwaitingRefund })
          await order.save({ session })

          // save the event to outbox
          outboxEvents.push(
            OrderAwaitingRefundPublisher.buildOutboxEvent({
              id: order.id,
              version: order.version,
              ticket: {
                id: ticket.id
              }
            })
          )
          continue
        }
      }

      // save the outbox events
      await Promise.all(outboxEvents.map((event) => event.save({ session })))

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