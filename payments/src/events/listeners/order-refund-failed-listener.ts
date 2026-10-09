import { Listener, OrderRefundFailedEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { Order } from "../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"

export class OrderRefundFailedListener extends Listener<OrderRefundFailedEvent> {
  readonly subject = Subjects.OrderRefundFailed
  queueGroupName = queueGroupName

  async onMessage(data: OrderRefundFailedEvent["data"], msg: JsMsg) {
    const order = await Order.findById(data.id)

    if (!order)
      throw Error("Order not found")

    if (order.version >= data.version)
      return msg.ack()

    if (order.version !== data.version - 1)
      throw new Error("Out of order event received")

    order.set({
      version: data.version,
      status: OrderStatus.RefundFailed
    })
    await order.save()

    msg.ack()
  }
}