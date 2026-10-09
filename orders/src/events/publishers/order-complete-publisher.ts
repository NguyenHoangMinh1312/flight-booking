import type { OrderCompleteEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class OrderCompletePublisher extends Publisher<OrderCompleteEvent> {
  readonly subject = Subjects.OrderComplete

  static buildOutboxEvent(payload: OrderCompleteEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.OrderComplete,
      payload
    })
  }
}