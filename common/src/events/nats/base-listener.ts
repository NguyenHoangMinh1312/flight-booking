import {
  NatsConnection, JsMsg, JSONCodec,
  AckPolicy, DeliverPolicy, nanos,
} from "nats"
import type { Subjects } from "../subjects"
import { streamName } from "./stream-name"

const jc = JSONCodec()

interface Event {
  subject: Subjects
  data: any
}

export abstract class Listener<T extends Event> {
  protected nc: NatsConnection
  abstract subject: T["subject"]
  abstract queueGroupName: string
  abstract onMessage(data: T["data"], msg: JsMsg): void | Promise<void>
  protected ackWait = 5 * 1000

  constructor(nc: NatsConnection) {
    this.nc = nc
  }

  get durableName(): string {
    return `${this.queueGroupName}-${this.subject.replace(/\./g, "-")}`
  }

  async listen(): Promise<void> {
    const jsm = await this.nc.jetstreamManager()
    const js = this.nc.jetstream()

    // Create the durable consumer if it doesn't exist yet
    try {
      await jsm.consumers.info(streamName, this.durableName)
    } catch {
      await jsm.consumers.add(streamName, {
        durable_name: this.durableName,
        filter_subject: this.subject,
        ack_policy: AckPolicy.Explicit,
        ack_wait: nanos(this.ackWait),
        deliver_policy: DeliverPolicy.All,
      })
    }

    const consumer = await js.consumers.get(streamName, this.durableName)
    const messages = await consumer.consume()
    console.log(`Subscribed to ${this.subject} [${this.durableName}]`)

    void (async () => {
      for await (const msg of messages) {
        console.log(`Message received: ${this.subject}/${this.durableName}`)
        try {
          const data = jc.decode(msg.data) as T["data"]
          await this.onMessage(data, msg)
        } catch (err) {
          console.error("Error handling message", err)
          msg.nak()
        }
      }
    })()
  }
}