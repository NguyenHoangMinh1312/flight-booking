import { MongoMemoryReplSet } from "mongodb-memory-server"
import { beforeAll, beforeEach, afterAll } from "@jest/globals"
import jwt from "jsonwebtoken"
import { jest } from "@jest/globals"
import mongoose from "mongoose"
import { UserRole } from "@mint1312-flight-booking/common"

declare global {
  var signin: (role: UserRole, id?: string) => string[]
}

jest.mock("../nats-wrapper")
jest.mock("../workers/refund-worker")
jest.mock("../services/payment-clients/stripe-client")

let mongo: MongoMemoryReplSet

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf"
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"
  jest.clearAllMocks()
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  const mongoUri = mongo.getUri()

  await mongoose.connect(mongoUri, {})
})

// reset the database before each test
beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
})

// disconnect from mongodb after all tests
afterAll(async () => {
  await mongoose.connection.close()
  if (mongo) {
    await mongo.stop()
  }
}, 30000)

// global helper function for testing 
global.signin = (role: UserRole, id?: string) => {
  // Build a JWT payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    role
  }

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build the session object
  const session = { jwt: token }

  // Turn session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it to base64
  const base64 = Buffer.from(sessionJSON).toString("base64")

  return [`session=${base64}`]
}
