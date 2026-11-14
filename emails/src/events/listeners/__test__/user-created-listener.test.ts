import { UserCreatedEvent } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { natsWrapper } from "../../../nats-wrapper"
import { UserCreatedListener } from "../user-created-listener"
import mongoose from "mongoose"
import { User } from "../../../models/user"

const setup = async () => {
  const listener = new UserCreatedListener(natsWrapper.nc)

  const data: UserCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  }

  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, data, msg }
}

it("Creates and saves a user when receiving a user:created event", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const user = await User.findById(data.id)
  expect(user).not.toBeNull()
  expect(user!.id).toEqual(data.id)
  expect(user!.email).toEqual(data.email)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it("handles duplicate user:created events idempotently and acks the message", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)
  await listener.onMessage(data, msg)

  const users = await User.find({ _id: data.id })
  expect(users).toHaveLength(1)
  expect(msg.ack).toHaveBeenCalledTimes(2)
})

