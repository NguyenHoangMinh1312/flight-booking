import request from "supertest"
import { app } from "../../app"
import { Otp } from "../../models/otp"
import { User } from "../../models/user"
import { Outbox } from "../../models/outbox"
import { Subjects, UserRole } from "@mint1312-flight-booking/common"

it("Returns 400 with an invalid email", async () => {
  await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "invalid-email",
    })
    .expect(400)
})

it("Returns 400 when email is missing", async () => {
  await request(app)
    .post("/api/users/resend-otp")
    .send({})
    .expect(400)
})

it("Returns 400 when OTP record does not exist", async () => {
  await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "test@test.com",
    })
    .expect(400)
})

it("Returns 400 when OTP has expired", async () => {
  await Otp.build({
    email: "test@test.com",
    otp: "123456",
    expiresAt: new Date(Date.now()),
    lastSentAt: new Date(Date.now() - 2 * 60 * 1000),
  }).save()

  await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "test@test.com",
    })
    .expect(400)
})

it("Returns 400 when resending OTP within the 1-minute cooldown window", async () => {
  await Otp.build({
    email: "test@test.com",
    otp: "123456",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    lastSentAt: new Date(),
  }).save()

  await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "test@test.com",
    })
    .expect(400)
})

it("Returns 400 when the user does not exist", async () => {
  await Otp.build({
    email: "test@test.com",
    otp: "123456",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    lastSentAt: new Date(Date.now() - 2 * 60 * 1000),
  }).save()

  await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "test@test.com",
    })
    .expect(400)
})

it("Returns 400 when the user is already verified", async () => {
  await User.build({
    email: "test@test.com",
    password: "password",
    role: UserRole.Customer,
    isVerified: true,
  }).save()

  await Otp.build({
    email: "test@test.com",
    otp: "123456",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    lastSentAt: new Date(Date.now() - 2 * 60 * 1000),
  }).save()

  await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "test@test.com",
    })
    .expect(400)
})

it("Returns 200, updates lastSentAt, and saves an outbox event when resend is valid", async () => {
  await User.build({
    email: "test@test.com",
    password: "password",
    role: UserRole.Customer,
    isVerified: false,
  }).save()

  const initialLastSentAt = new Date(Date.now() - 2 * 60 * 1000)
  await Otp.build({
    email: "test@test.com",
    otp: "123456",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    lastSentAt: initialLastSentAt,
  }).save()

  const response = await request(app)
    .post("/api/users/resend-otp")
    .send({
      email: "test@test.com",
    })
    .expect(200)

  expect(response.body.message).toEqual("Your OTP has been sent")

  const updatedOtp = await Otp.findOne({ email: "test@test.com" })
  expect(updatedOtp).toBeDefined()
  expect(updatedOtp!.lastSentAt.getTime()).toBeGreaterThan(initialLastSentAt.getTime())

  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toHaveLength(1)
  expect(outboxEvents[0]!.eventType).toEqual(Subjects.UserOtpRequested)
  expect(outboxEvents[0]!.payload.email).toEqual("test@test.com")
  expect(outboxEvents[0]!.payload.otp).toEqual("123456")
})
