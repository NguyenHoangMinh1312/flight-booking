import { Listener, OrderCanceledEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { Order } from "../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  readonly subject = Subjects.OrderCanceled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCanceledEvent["data"], msg: JsMsg) {
    const order = await Order.findById(data.id)

    if (!order)
      throw Error("Order not found")

    if (order.version >= data.version)
      return msg.ack()

    if (order.version !== data.version - 1)
      throw new Error("Out of order event received")

    order.set({
      version: data.version,
      status: OrderStatus.Canceled
    })
    await order.save()

    msg.ack()
  }
}