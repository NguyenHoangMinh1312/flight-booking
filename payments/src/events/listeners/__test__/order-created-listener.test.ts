import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedEvent, OrderStatus } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Order } from "../../../models/order"

const setup = async () => {
  // create an event listener
  const listener = new OrderCreatedListener(natsWrapper.nc)

  // create a fake event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10
    }
  }

  // fake the ack function
  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, data, msg }
}

it(
  "Checks if the listener handles event order:created successfully",
  async () => {
    const { listener, data, msg } = await setup()

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order is created
    const order = await Order.findById(data.id)
    expect(order).toBeDefined()
    expect(order!.version).toEqual(data.version)
    expect(order!.price).toEqual(data.ticket.price)
    expect(order!.userId).toEqual(data.userId)
    expect(order!.status).toEqual(data.status)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)

it(
  "Acks the message and does not overwrite when the order already exists",
  async () => {
    const { listener, data, msg } = await setup()

    const existingOrder = Order.build({
      id: data.id,
      version: 0,
      userId: data.userId,
      status: OrderStatus.Created,
      price: 50
    })
    await existingOrder.save()

    await listener.onMessage(data, msg)

    const orders = await Order.find({ _id: data.id })
    expect(orders).toHaveLength(1)
    expect(orders[0]!.price).toEqual(50)
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)
