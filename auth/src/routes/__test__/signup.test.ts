import request from "supertest"
import { app } from "../../app"
import { Outbox } from "../../models/outbox"
import { Subjects, UserRole } from "@mint1312-flight-booking/common"
import { User } from "../../models/user"
import { Otp } from "../../models/otp"
import { Password } from "../../utils/password"

it("Returns 201 on successful customer signup", () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200)
})

it("Returns 400 with invalid email", () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test",
      password: "password",
    })
    .expect(400)
})

it("Returns 400 with invalid password", () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "pas",
    })
    .expect(400)
})

it("Returns 400 with missing credentials", () => {
  return request(app)
    .post("/api/users/signup")
    .send({})
    .expect(400)
})

it("Disallow duplicate emails and roles", async () => {
  const user = User.build({
    email: "test@test.com",
    password: "password",
    role: UserRole.Customer,
    isVerified: true
  })
  await user.save()

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(400)
})

it("Allows re-signup for an unverified user, updates password, and replaces previous OTP", async () => {
  const user = User.build({
    email: "test@test.com",
    password: "oldpassword",
    role: UserRole.Customer,
    isVerified: false
  })
  await user.save()

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "newpassword"
    })
    .expect(200)

  const users = await User.find({ email: "test@test.com" })
  expect(users).toHaveLength(1)
  const passwordMatch = await Password.compare(users[0]!.password, "newpassword")
  expect(passwordMatch).toBe(true)

  const otps = await Otp.find({ email: "test@test.com" })
  expect(otps).toHaveLength(1)

  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toHaveLength(1)
  expect(outboxEvents[0]!.eventType).toEqual(Subjects.UserOtpRequested)
  expect(outboxEvents[0]!.payload.otp).toEqual(otps[0]!.otp)
})

it("Returns 200 for successful signup request", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200)

  // check if event is saved to outbox
  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toBeDefined()
  expect(outboxEvents).toHaveLength(1)
  expect(outboxEvents[0]!.eventType).toEqual(Subjects.UserOtpRequested)
  expect(outboxEvents[0]!.payload.email).toEqual("test@test.com")
})



