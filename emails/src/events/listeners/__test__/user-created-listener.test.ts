import { UserCreatedEvent } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { natsWrapper } from "../../../nats-wrapper"
import { UserCreatedListener } from "../user-created-listener"
import mongoose from "mongoose"
import { User } from "../../../models/user"

it(
  "Checks if the listener handles the event user:created successfully",
  async () => {
    // create an event listener
    const listener = new UserCreatedListener(natsWrapper.js)

    // create a fake event
    const data: UserCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      email: "test@test.com"
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // checks if the user is saved to db
    const user = await User.findOne({ id: data.id, email: data.email })
    expect(user).toBeDefined()

    // checks if the ack is sent
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)