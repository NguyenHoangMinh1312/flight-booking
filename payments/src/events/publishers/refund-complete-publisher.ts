import type { RefundCompleteEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class RefundCompletePublisher extends Publisher<RefundCompleteEvent> {
  readonly subject = Subjects.RefundComplete

  static buildOutboxEvent(payload: RefundCompleteEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.RefundComplete,
      payload
    })
  }
}