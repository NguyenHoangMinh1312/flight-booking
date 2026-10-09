import mongoose from "mongoose"
import { beforeAll, beforeEach, afterAll } from "@jest/globals"
import { jest } from "@jest/globals"
import { MongoMemoryReplSet } from "mongodb-memory-server"

jest.mock("../nats-wrapper")
jest.mock("../queues/email-send-queue")

let mongo: MongoMemoryReplSet

beforeAll(async () => {
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
