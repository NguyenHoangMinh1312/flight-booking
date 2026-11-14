import { OrderCompleteEvent } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCompleteListener } from "../order-complete-listener"
import mongoose from "mongoose"
import { User } from "../../../models/user"
import { emailSendWorker } from "../../../workers/email-send-worker"

const setup = async () => {
  const listener = new OrderCompleteListener(natsWrapper.nc)

  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  })
  await user.save()

  const data: OrderCompleteEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString()
    },
    userId: user.id
  }

  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, user, data, msg }
}

it("Queues a confirmation email with order, ticket, and link details", async () => {
  const { listener, user, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(emailSendWorker.add).toHaveBeenCalledTimes(1)
  expect(emailSendWorker.add).toHaveBeenCalledWith(
    expect.objectContaining({
      receiver: user.email,
      subject: "Thank you for your order!",
      content: expect.stringMatching(
        new RegExp(
          `${data.id}.*${data.ticket.id}.*http://flight-booking\\.shop/orders/${data.id}`,
          "s"
        )
      )
    })
  )

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it("Throws an error and does not queue an email or ack when the user is not found", async () => {
  const { listener, data, msg } = await setup()
  data.userId = new mongoose.Types.ObjectId().toHexString()

  await expect(listener.onMessage(data, msg)).rejects.toThrow("User not found")

  expect(emailSendWorker.add).not.toHaveBeenCalled()
  expect(msg.ack).not.toHaveBeenCalled()
})

it("Does not ack the message if queuing the email fails", async () => {
  const { listener, data, msg } = await setup()
  jest.spyOn(emailSendWorker, "add").mockRejectedValueOnce(new Error("Queue error"))

  await expect(listener.onMessage(data, msg)).rejects.toThrow("Queue error")

  expect(msg.ack).not.toHaveBeenCalled()
})

