import type { OrderCanceledEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class OrderCanceledPublisher extends Publisher<OrderCanceledEvent> {
  readonly subject = Subjects.OrderCanceled

  static buildOutboxEvent(payload: OrderCanceledEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.OrderCanceled,
      payload
    })
  }
}