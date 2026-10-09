import { Listener, OrderCreatedEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { Ticket } from "../../models/ticket"
import mongoose from "mongoose"
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher"

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id).populate("flight")

    if (!ticket)
      throw new Error("Ticket not found")

    if (ticket.orderId === data.id)
      return msg.ack()

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // save the ticket
      ticket.set({ orderId: data.id })
      await ticket.save({ session })

      // save the event to outbox
      const outboxEvent = TicketUpdatedPublisher.buildOutboxEvent({
        id: ticket.id,
        version: ticket.version,
        price: ticket.price,
        class: ticket.class,
        status: ticket.status,
        seat: ticket.seat,
        orderId: ticket.orderId!,
        departureDate: ticket.flight.departure.date
      })
      await outboxEvent.save({ session })

      // commit transaction
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
