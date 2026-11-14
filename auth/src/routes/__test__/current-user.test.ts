import request from "supertest"
import { app } from "../../app"
import { UserRole } from "@mint1312-flight-booking/common"

it("Response with correct details about the current user", async () => {
  const email = "test@test.com"
  const cookie = await global.signin(email, UserRole.Customer)

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200)

  expect(response.body.currentUser.email).toEqual(email)
  expect(response.body.currentUser.role).toEqual(UserRole.Customer)
})

it("Response with null if the user is not signed in", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200)

  expect(response.body.currentUser).toEqual(null)
})

it("Response with correct details when signed in as a manager", async () => {
  const email = "manager@test.com"
  const cookie = await global.signin(email, UserRole.Manager)

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200)

  expect(response.body.currentUser.email).toEqual(email)
  expect(response.body.currentUser.role).toEqual(UserRole.Manager)
})

it("Response with null if the session cookie contains an invalid token", async () => {
  const invalidSession = Buffer.from(JSON.stringify({ jwt: "invalid.jwt.token" })).toString("base64")

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", [`session=${invalidSession}`])
    .send()
    .expect(200)

  expect(response.body.currentUser).toEqual(null)
})
