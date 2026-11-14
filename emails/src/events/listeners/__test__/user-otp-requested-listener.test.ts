import { UserOtpRequestedEvent } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { natsWrapper } from "../../../nats-wrapper"
import { UserOtpRequestedListener } from "../user-otp-requested-listener"
import { emailSendWorker } from "../../../workers/email-send-worker"

const setup = async () => {
  const listener = new UserOtpRequestedListener(natsWrapper.nc)

  const data: UserOtpRequestedEvent["data"] = {
    email: "test@test.com",
    otp: "123456"
  }

  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, data, msg }
}

it("Queues a verification email containing the OTP code", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(emailSendWorker.add).toHaveBeenCalledTimes(1)
  expect(emailSendWorker.add).toHaveBeenCalledWith(
    expect.objectContaining({
      receiver: data.email,
      subject: "Your Flight Booking Verification Code",
      content: expect.stringContaining(`<h1>${data.otp}</h1>`)
    })
  )

  expect(msg.ack).toHaveBeenCalledTimes(1)
})


it("Does not ack the message if queuing the email fails", async () => {
  const { listener, data, msg } = await setup()
  jest.spyOn(emailSendWorker, "add").mockRejectedValueOnce(new Error("Queue error"))

  await expect(listener.onMessage(data, msg)).rejects.toThrow("Queue error")

  expect(msg.ack).not.toHaveBeenCalled()
})

