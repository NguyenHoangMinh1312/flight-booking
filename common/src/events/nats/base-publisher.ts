import { NatsConnection, JetStreamClient, JSONCodec } from "nats"
import type { Subjects } from "../subjects"

const jc = JSONCodec()

interface Event {
  subject: Subjects
  data: any
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"]
  protected js: JetStreamClient

  constructor(protected nc: NatsConnection) {
    this.js = nc.jetstream()
  }

  async publish(data: T["data"]): Promise<void> {
    await this.js.publish(this.subject, jc.encode(data))
    console.log("Event published to", this.subject)
  }
}