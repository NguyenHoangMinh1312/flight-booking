import type { UserOtpRequestedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class UserOtpRequestedPublisher extends Publisher<UserOtpRequestedEvent> {
  readonly subject = Subjects.UserOtpRequested

  static buildOutboxEvent(payload: UserOtpRequestedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.UserOtpRequested,
      payload
    })
  }
} 