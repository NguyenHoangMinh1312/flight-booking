import type { TicketCanceledEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class TicketCanceledPublisher extends Publisher<TicketCanceledEvent> {
  readonly subject = Subjects.TicketCanceled

  static buildOutboxEvent(payload: TicketCanceledEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.TicketCanceled,
      payload
    })
  }
}