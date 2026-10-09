import mongoose from "mongoose"
import { app } from "./app"
import { User } from "./models/user"
import { UserRole } from "@mint1312-flight-booking/common"
import { natsWrapper } from "./nats-wrapper"
import { outboxPublisherWorker } from "./events/publishers/outbox-publisher-worker"

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error("No JWT_KEY found!")

  if (!process.env.MONGO_URI)
    throw new Error("No MONGO_URI found!")

  if (!process.env.NATS_URL)
    throw new Error("No NATS_URL found!")

  if (!process.env.NATS_CLIENT_ID)
    throw new Error("No NATS_CLIENT_ID found!")

  if (!process.env.NATS_CLUSTER_ID)
    throw new Error("No NATS_CLUSTER_ID found!")

  if (!process.env.MANAGER_EMAIL)
    throw new Error("No MANAGER_EMAIL found!")

  if (!process.env.MANAGER_PASSWORD)
    throw new Error("No MANAGER_PASSWORD found!")

  try {
    // connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL)

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!")
      process.exit()
    })

    process.on("SIGINT", () => natsWrapper.client.close())
    process.on("SIGTERM", () => natsWrapper.client.close())

    // connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // run the publisher worker
    outboxPublisherWorker()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  // create the manager account
  const existingManager = await User.findOne({ email: process.env.MANAGER_EMAIL })
  if (!existingManager) {
    const manager = User.build({
      email: process.env.MANAGER_EMAIL,
      password: process.env.MANAGER_PASSWORD,
      role: UserRole.Manager,
      isVerified: true
    })
    await manager.save()
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
}

start()
