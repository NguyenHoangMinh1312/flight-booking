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
})

it("Response with null if the user is not signed in", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200)

  expect(response.body.currentUser).toEqual(null)
})