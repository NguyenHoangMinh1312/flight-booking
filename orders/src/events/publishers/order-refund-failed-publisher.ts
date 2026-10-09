import { OrderRefundFailedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class OrderRefundFailedPublisher extends Publisher<OrderRefundFailedEvent> {
  readonly subject = Subjects.OrderRefundFailed

  static buildOutboxEvent(payload: OrderRefundFailedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.OrderRefundFailed,
      payload
    })
  }
}