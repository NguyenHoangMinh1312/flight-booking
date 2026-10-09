import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"

it(
  "Checks if the listener handles event order:created successfully",
  async () => {
    // create an event listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create a fake event
    const data: OrderCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: new Date().toISOString(),
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10
      }
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order is created
    const order = await Order.findById(data.id)
    expect(order).toBeDefined()
    expect(order!.version).toEqual(data.version)
    expect(order!.price).toEqual(data.ticket.price)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
