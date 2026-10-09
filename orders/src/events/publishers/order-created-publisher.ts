import type { OrderCreatedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated

  static buildOutboxEvent(payload: OrderCreatedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.OrderCreated,
      payload
    })
  }
}