import request from "supertest"
import { app } from "../../app"
import { airports } from "../../data/seed-airports"

const setup = async () => {
  return request(app)
    .get("/api/flights/airports")
    .expect(200)
}

it("Returns list of airports", async () => {
  const response = await setup()

  expect(response.body).toEqual(airports)
  expect(response.body).toHaveLength(airports.length)
})

it("Returns airport objects with code, name, city, and country fields", async () => {
  const response = await setup()

  for (const airport of response.body) {
    expect(airport).toEqual(
      expect.objectContaining({
        code: expect.any(String),
        name: expect.any(String),
        city: expect.any(String),
        country: expect.any(String)
      })
    )
  }

  expect(response.body).toContainEqual({
    code: "HAN",
    name: "Noi Bai International Airport",
    city: "Hanoi",
    country: "Vietnam"
  })
  expect(response.body).toContainEqual({
    code: "SGN",
    name: "Tan Son Nhat International Airport",
    city: "Ho Chi Minh City",
    country: "Vietnam"
  })
})
