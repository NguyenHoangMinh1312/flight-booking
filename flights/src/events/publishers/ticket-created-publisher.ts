import type { TicketCreatedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated

  static buildOutboxEvent(payload: TicketCreatedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.TicketCreated,
      payload
    })
  }
}