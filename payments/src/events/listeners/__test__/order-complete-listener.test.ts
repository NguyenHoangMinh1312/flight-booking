import { OrderCompleteListener } from "../order-complete-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCompleteEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Order } from "../../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"

it(
  "Checks if the listener handles event order:created successfully",
  async () => {
    // create an event listener
    const listener = new OrderCompleteListener(natsWrapper.nc)

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
    const data: OrderCompleteEvent["data"] = {
      id: order.id,
      version: order.version + 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
      userId: new mongoose.Types.ObjectId().toHexString()
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order status is updated
    const updatedOrder = await Order.findById(data.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder?.version).toEqual(data.version)
    expect(updatedOrder?.status).toEqual(OrderStatus.Complete)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
