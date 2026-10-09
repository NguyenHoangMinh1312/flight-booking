import request from "supertest"
import { app } from "../../app"
import { UserRole } from "@mint1312-flight-booking/common"

it("Clears the cookie after signing out", async () => {
  await global.signin("test@test.com", UserRole.Customer)

  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200)

  const cookie = response.get("Set-Cookie");
  expect(cookie![0]).toEqual("session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly")
})