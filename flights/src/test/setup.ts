import mongoose from "mongoose"
import { beforeAll, beforeEach, afterAll } from "@jest/globals"
import jwt from "jsonwebtoken"
import { jest } from "@jest/globals"
import { UserRole } from "@mint1312-flight-booking/common"
import { MongoMemoryReplSet } from "mongodb-memory-server"

declare global {
  var signin: (role: UserRole) => string[]
}

jest.mock("../nats-wrapper")

let mongo: MongoMemoryReplSet

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf"
  jest.clearAllMocks()
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  const mongoUri = mongo.getUri()

  await mongoose.connect(mongoUri, {})
})

// reset the database and mocks before each test
beforeEach(async () => {
  jest.clearAllMocks()
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
})

// global helper function for testing 
global.signin = (role: UserRole) => {
  // Build a JWT payload
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
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
