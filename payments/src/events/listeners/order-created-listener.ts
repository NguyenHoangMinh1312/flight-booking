import { Listener, OrderCreatedEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { Order } from "../../models/order"

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    const existingOrder = await Order.findById(data.id)

    if (existingOrder)
      return msg.ack()

    const order = Order.build({
      id: data.id,
      version: data.version,
      userId: data.userId,
      status: data.status,
      price: data.ticket.price
    })
    await order.save()

    msg.ack()
  }
}