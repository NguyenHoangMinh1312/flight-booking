import { MongoMemoryReplSet } from "mongodb-memory-server"
import { beforeAll, beforeEach, afterAll } from "@jest/globals"
import jwt from "jsonwebtoken"
import { jest } from "@jest/globals"
import mongoose from "mongoose"

declare global {
  var signin: (id?: string) => string[]
}

jest.mock("../nats-wrapper")
jest.mock("../queues/refund-queue")
jest.mock("../stripe")

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
  if (mongo) {
    await mongo.stop()
  }
  await mongoose.connection.close()
}, 30000)

// global helper function for testing 
global.signin = (id?: string) => {
  // Build a JWT payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
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
