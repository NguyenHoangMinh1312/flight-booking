import request from "supertest"
import { app } from "../../app"
import { airports } from "../../data/seed-airports"

it(
  "Returns list of airports",
  async () => {
    const response = await request(app)
      .get("/api/flights/airports")
      .expect(200)

    expect(response.body).toEqual(airports)
  }
)