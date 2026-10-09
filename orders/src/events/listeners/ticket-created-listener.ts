import { Message } from "node-nats-streaming"
import { Subjects, Listener, TicketCreatedEvent, FlightStatus } from "@mint1312-flight-booking/common"
import { Ticket } from "../../models/ticket"
import { queueGroupName } from "./queue-group-name"

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = queueGroupName

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const existingTicket = await Ticket.findById(data.id)
    if (existingTicket)
      return msg.ack()

    const ticket = Ticket.build({
      id: data.id,
      version: data.version,
      price: data.price,
      class: data.class,
      status: data.status as FlightStatus,
      seat: data.seat,
      departureDate: data.departureDate
    })
    await ticket.save()

    msg.ack()
  }
}