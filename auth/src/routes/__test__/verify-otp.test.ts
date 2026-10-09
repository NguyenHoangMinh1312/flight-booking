import request from "supertest"
import { app } from "../../app"
import { Otp } from "../../models/otp"
import { User } from "../../models/user"
import { Subjects, UserRole } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

it(
  "Returns 400 when OTP is not found",
  async () => {
    await request(app)
      .post("/api/users/verify-otp")
      .send({
        email: "test@test.com",
        otp: "123456"
      })
      .expect(400)
  }
)

it(
  "Returns 400 when OTP is expired",
  async () => {
    const otpDoc = Otp.build({
      email: "test@test.com",
      otp: "123456",
      expiresAt: new Date(),
      lastSentAt: new Date()
    })
    await otpDoc.save()

    await request(app)
      .post("/api/users/verify-otp")
      .send({
        email: "test@test.com",
        otp: "123456"
      })
      .expect(400)
  }
)

it(
  "Returns 400 when OTP is max attempts reached",
  async () => {
    const otpDoc = Otp.build({
      email: "test@test.com",
      otp: "123456",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      lastSentAt: new Date()
    })
    otpDoc.set({ attempts: 10 })
    await otpDoc.save()

    await request(app)
      .post("/api/users/verify-otp")
      .send({
        email: "test@test.com",
        otp: "123456"
      })
      .expect(400)

    // check if the otp is deleted
    const otpDocs = await Otp.find({})
    expect(otpDocs).toHaveLength(0)
  }
)

it(
  "Returns 400 when OTP is wrong",
  async () => {
    await Otp.build({
      email: "test@test.com",
      otp: "123456",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      lastSentAt: new Date()
    }).save()

    await request(app)
      .post("/api/users/verify-otp")
      .send({
        email: "test@test.com",
        otp: "654321"
      })
      .expect(400)

    // check if the otp is attempt is increased
    const otpDocs = await Otp.find({})
    expect(otpDocs).toBeDefined()
    expect(otpDocs).toHaveLength(1)
    expect(otpDocs[0]!.attempts).toEqual(1)
  }
)

it(
  "Returns 400 when the user email not exists",
  async () => {
    await Otp.build({
      email: "test@test.com",
      otp: "123456",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      lastSentAt: new Date()
    }).save()

    await request(app)
      .post("/api/users/verify-otp")
      .send({
        email: "test@test.com",
        otp: "123456"
      })
      .expect(400)
  }
)

it(
  "Returns 200 when the otp is valid",
  async () => {
    const user = User.build({
      email: "test@test.com",
      password: "password",
      role: UserRole.Customer,
    })
    await user.save()

    await Otp.build({
      email: "test@test.com",
      otp: "123456",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      lastSentAt: new Date()
    }).save()

    const response = await request(app)
      .post("/api/users/verify-otp")
      .send({
        email: "test@test.com",
        otp: "123456"
      })
      .expect(200)

    // check if the user is verified
    const verifiedUser = await User.findById(user.id)
    expect(verifiedUser?.isVerified).toEqual(true)

    // check if the otp is deleted
    const otp = await Otp.findOne({ email: user.email })
    expect(otp).toBeNull()

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.UserCreated)
    expect(outboxEvents[0]?.payload.id).toEqual(user.id)
    expect(outboxEvents[0]?.payload.email).toEqual(user.email)

    // check if the jwt is saved
    expect(response.get("Set-Cookie")).toBeDefined()
  }
)