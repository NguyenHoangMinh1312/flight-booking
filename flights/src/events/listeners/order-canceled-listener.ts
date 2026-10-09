import { Listener, OrderCanceledEvent, Subjects } from "@mint1312-flight-booking/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { Ticket } from "../../models/ticket"
import mongoose from "mongoose"
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher"

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  readonly subject = Subjects.OrderCanceled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCanceledEvent["data"], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id).populate("flight")

    if (!ticket)
      throw new Error("Ticket not found")

    if (ticket.orderId === undefined)
      return msg.ack()

    // db trnsaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // save the ticket
      ticket.set({ orderId: undefined })
      await ticket.save({ session })

      // save event to outbox
      const outboxEvent = TicketUpdatedPublisher.buildOutboxEvent({
        id: ticket.id,
        version: ticket.version,
        price: ticket.price,
        class: ticket.class,
        status: ticket.status,
        seat: ticket.seat,
        departureDate: ticket.flight.departure.date
      })
      await outboxEvent.save({ session })

      // commit db transaction
      await session.commitTransaction()

      msg.ack()
    } catch (err) {
      await session.abortTransaction()
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
}