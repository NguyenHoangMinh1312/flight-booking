import { OrderCanceledEvent } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCanceledListener } from "../order-canceled-listener"
import mongoose from "mongoose"
import { User } from "../../../models/user"
import { emailSendQueue } from "../../../queues/email-send-queue"

it(
  "Checks if the listener handles the event order:canceled successfully",
  async () => {
    // create an event listener
    const listener = new OrderCanceledListener(natsWrapper.nc)

    // create an user
    const user = User.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      email: "test@test.com"
    })
    await user.save()

    // create a fake event
    const data: OrderCanceledEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString()
      },
      userId: user.id
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // checks if the request sent to queue
    expect(emailSendQueue.add).toHaveBeenCalledTimes(1)
    expect(emailSendQueue.add).toHaveBeenCalledWith(
      expect.objectContaining({
        receiver: user.email,
        subject: `Your order ${data.id} has been canceled.`
      })
    )

    // checks if the ack is sent
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)