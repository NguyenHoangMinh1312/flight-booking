import type { RefundFailedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class RefundFailedPublisher extends Publisher<RefundFailedEvent> {
  readonly subject = Subjects.RefundFailed

  static buildOutboxEvent(payload: RefundFailedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.RefundFailed,
      payload
    })
  }
}