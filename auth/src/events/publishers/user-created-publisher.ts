import type { UserCreatedEvent } from "@mint1312-flight-booking/common"
import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  readonly subject = Subjects.UserCreated

  static buildOutboxEvent(payload: UserCreatedEvent["data"]) {
    return Outbox.build({
      eventType: Subjects.UserCreated,
      payload
    })
  }
} 