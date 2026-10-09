import type { TicketUpdatedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated

  static buildOutboxEvent(payload: TicketUpdatedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.TicketUpdated,
      payload
    })
  }
}