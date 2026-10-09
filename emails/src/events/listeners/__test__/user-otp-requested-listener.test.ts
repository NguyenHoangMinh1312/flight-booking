import { UserOtpRequestedEvent } from "@mint1312-flight-booking/common"
import { natsWrapper } from "../../../nats-wrapper"
import { UserOtpRequestedListener } from "../user-otp-requested-listener"
import mongoose from "mongoose"
import { User } from "../../../models/user"
import { emailSendQueue } from "../../../queues/email-send-queue"

it(
  "Checks if the listener handles the event user:otp-requested successfully",
  async () => {
    // create an event listener
    const listener = new UserOtpRequestedListener(natsWrapper.client)

    // create a fake event
    const data: UserOtpRequestedEvent["data"] = {
      email: "test@test.com",
      otp: "123456"
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // checks if the request is sent to queue
    expect(emailSendQueue.add).toHaveBeenCalledTimes(1)
    expect(emailSendQueue.add).toHaveBeenCalledWith(
      expect.objectContaining({
        receiver: data.email,
        content: expect.stringContaining(data.otp)
      })
    )

    // checks if the ack is sent
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)