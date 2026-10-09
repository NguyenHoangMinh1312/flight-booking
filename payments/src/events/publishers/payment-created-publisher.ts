import type { PaymentCreatedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated

  static buildOutboxEvent(payload: PaymentCreatedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.PaymentCreated,
      payload
    })
  }
}