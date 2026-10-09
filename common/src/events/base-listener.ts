import type { Message, Stan } from "node-nats-streaming"
import type { Subjects } from "./subjects"

// A tight coupling between the channel and the data allowed to send to that channel
interface Event {
  subject: Subjects
  data: any
}

// Base class for listeners to NATS
export abstract class Listener<T extends Event> {
  protected client: Stan
  abstract subject: T["subject"]
  abstract queueGroupName: string
  abstract onMessage(data: T["data"], msg: Message): void
  protected ackWait = 5 * 1000

  constructor(client: Stan) {
    this.client = client
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject}/${this.queueGroupName}`)

      const data = this.parseMessage(msg)

      this.onMessage(data, msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()

    if (typeof data === "string")
      return JSON.parse(data)
    else
      return JSON.parse(data.toString("utf8"))
  }
}