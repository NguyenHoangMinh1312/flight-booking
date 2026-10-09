import type { OrderAwaitingRefundEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class OrderAwaitingRefundPublisher extends Publisher<OrderAwaitingRefundEvent> {
  readonly subject = Subjects.OrderAwaitingRefund

  static buildOutboxEvent(payload: OrderAwaitingRefundEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.OrderAwaitingRefund,
      payload
    })
  }
}