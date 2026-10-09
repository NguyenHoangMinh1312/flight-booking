import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { beforeAll, beforeEach, afterAll } from "@jest/globals"
import request from "supertest"
import { app } from "../app"
import { UserRole } from "@mint1312-flight-booking/common"
import { User } from "../models/user"

declare global {
  var signin: (email: string, role: UserRole) => Promise<string[]>
}

jest.mock("../nats-wrapper")

let mongo: MongoMemoryReplSet

// connect to mongodb first
beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf"
  jest.clearAllMocks()
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  const mongoUri = mongo.getUri();

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
})

// global helper function for testing 
global.signin = async (email: string, role: UserRole) => {
  const user = User.build({
    email,
    password: "password",
    role,
    isVerified: true
  })
  await user.save()

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email,
      password: "password",
      role
    })
    .expect(200)

  const cookie = response.get("Set-Cookie")

  if (!cookie)
    throw new Error("Failed to get cookie from response")
  return cookie
}
