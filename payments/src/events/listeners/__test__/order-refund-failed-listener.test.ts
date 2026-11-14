import { OrderRefundFailedListener } from "../order-refund-failed-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderRefundFailedEvent, OrderStatus } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Order } from "../../../models/order"

const setup = async () => {
  // create an event listener
  const listener = new OrderRefundFailedListener(natsWrapper.nc)

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
  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, order, data, msg }
}

it(
  "Checks if the listener handles event order:refund-failed successfully",
  async () => {
    const { listener, data, msg } = await setup()

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order status is updated
    const updatedOrder = await Order.findById(data.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder?.version).toEqual(data.version)
    expect(updatedOrder?.status).toEqual(OrderStatus.RefundFailed)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)

it(
  "Throws an error when the order is not found",
  async () => {
    const { listener, data, msg } = await setup()
    data.id = new mongoose.Types.ObjectId().toHexString()

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Order not found")
    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Acks the message and does not update the order when a duplicate or old event is received",
  async () => {
    const { listener, order, data, msg } = await setup()
    data.version = order.version

    await listener.onMessage(data, msg)

    const unchangedOrder = await Order.findById(order.id)
    expect(unchangedOrder?.version).toEqual(0)
    expect(unchangedOrder?.status).toEqual(OrderStatus.Created)
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)

it(
  "Throws an error when an out-of-order event is received",
  async () => {
    const { listener, order, data, msg } = await setup()
    data.version = order.version + 2

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Out of order event received")
    expect(msg.ack).not.toHaveBeenCalled()
  }
)
