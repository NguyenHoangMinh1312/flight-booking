import request from "supertest"
import { app } from "../../app"
import { UserRole } from "@mint1312-flight-booking/common"
import { User } from "../../models/user"

async function buildVerifiedUser() {
  const user = User.build({
    email: "test@test.com",
    password: "password",
    role: UserRole.Customer,
    isVerified: true
  })
  await user.save()
}

it("Returns 200 on successful customer signin", async () => {
  await buildVerifiedUser()

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
      role: UserRole.Customer
    })
    .expect(200)

  expect(response.get("Set-Cookie")).toBeDefined()
})

it("Returns 400 on incorrect email", async () => {
  await buildVerifiedUser()

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test1.com",
      password: "password",
      role: UserRole.Customer
    })
    .expect(400)
})

it("Returns 400 on incorrect password", async () => {
  await buildVerifiedUser()

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password_1",
      role: UserRole.Customer
    })
    .expect(400)
})

it("Returns 400 on incorrect role", async () => {
  await buildVerifiedUser()

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
      role: UserRole.Manager
    })
    .expect(400)
})
