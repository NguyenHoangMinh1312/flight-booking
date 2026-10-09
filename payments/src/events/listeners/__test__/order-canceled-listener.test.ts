import { OrderCanceledListener } from "../order-canceled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCanceledEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"

it(
  "Checks if the listener handles event order:canceled successfully",
  async () => {
    // create an event listener
    const listener = new OrderCanceledListener(natsWrapper.client)

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
    const data: OrderCanceledEvent["data"] = {
      id: order.id,
      version: order.version + 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
      userId: new mongoose.Types.ObjectId().toHexString()
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
    expect(updatedOrder?.status).toEqual(OrderStatus.Canceled)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
