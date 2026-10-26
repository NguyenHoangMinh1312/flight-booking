import mongoose from "mongoose"
import { app } from "./app"
import { OrderCreatedListener } from "./events/listeners/order-created-listener"
import { OrderCanceledListener } from "./events/listeners/order-canceled-listener"
import { outboxPublisherWorker } from "./events/publishers/outbox-publisher-worker"
import { natsWrapper } from "./nats-wrapper"
import { seedAirports } from "./data/seed-airports"

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error("No JWT_KEY found!")

  if (!process.env.MONGO_URI)
    throw new Error("No MONGO_URI found!")

  if (!process.env.NATS_URL)
    throw new Error("No NATS_URL found!")

  try {
    // connect to NATS
    await natsWrapper.connect(process.env.NATS_URL)

    // Listen to events from other services
    new OrderCreatedListener(natsWrapper.nc).listen()
    new OrderCanceledListener(natsWrapper.nc).listen()

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Seed initial airports
    await seedAirports()

    // start outbox worker
    outboxPublisherWorker()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
}

start()