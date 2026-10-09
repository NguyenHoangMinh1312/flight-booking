import { OrderRefundFailedListener } from "../order-refund-failed-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderRefundFailedEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"

it(
  "Checks if the listener handles event order:refund-failed successfully",
  async () => {
    // create an event listener
    const listener = new OrderRefundFailedListener(natsWrapper.client)

    // create a new order
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 10
    })
    await order.save()

    // create a fake event
    const data: OrderRefundFailedEvent["data"] = {
      id: order.id,
      version: order.version + 1
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order status is updated
    const updatedOrder = await Order.findById(data.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder?.version).toEqual(data.version)
    expect(updatedOrder?.status).toEqual(OrderStatus.RefundFailed)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
