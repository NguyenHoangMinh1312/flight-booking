import { Message } from "node-nats-streaming"
import { Subjects, Listener, TicketUpdatedEvent } from "@mint1312-flight-booking/common"
import { Ticket } from "../../models/ticket"
import { queueGroupName } from "./queue-group-name"

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    // find the previous ticket version
    const ticket = await Ticket.findById(data.id)

    if (!ticket)
      throw new Error("Ticket not found")

    if (ticket.version >= data.version)
      return msg.ack()

    if (ticket.version !== data.version - 1)
      throw new Error("Out of order event received")

    ticket.set({
      version: data.version,
      price: data.price,
      class: data.class,
      status: data.status,
      seat: data.seat,
      departureDate: data.departureDate,
    })

    await ticket.save()

    msg.ack()
  }
}