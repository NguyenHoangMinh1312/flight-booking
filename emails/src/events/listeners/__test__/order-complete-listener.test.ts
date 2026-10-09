import { OrderCompleteEvent } from "@mint1312-flight-booking/common"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCompleteListener } from "../order-complete-listener"
import mongoose from "mongoose"
import { User } from "../../../models/user"
import { emailSendQueue } from "../../../queues/email-send-queue"

it(
  "Checks if the listener handles the event order:comnplete successfully",
  async () => {
    // create an event listener
    const listener = new OrderCompleteListener(natsWrapper.client)

    // create an user
    const user = User.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      email: "test@test.com"
    })
    await user.save()

    // create a fake event
    const data: OrderCompleteEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString()
      },
      userId: user.id
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // checks if the request sent to queue
    expect(emailSendQueue.add).toHaveBeenCalledTimes(1)
    expect(emailSendQueue.add).toHaveBeenCalledWith(
      expect.objectContaining({
        receiver: user.email,
        content: expect.stringMatching(
          new RegExp(`${data.id}.*${data.ticket.id}`)
        )
      })
    )

    // checks if the ack is sent
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)