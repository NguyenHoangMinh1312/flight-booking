import mongoose from "mongoose"
import { app } from "./app"
import { natsWrapper } from "./nats-wrapper"
import { OrderCreatedListener } from "./events/listeners/order-created-listener"
import { OrderCanceledListener } from "./events/listeners/order-canceled-listener"
import { OrderCompleteListener } from "./events/listeners/order-complete-listener"
import { OrderAwaitingRefundListener } from "./events/listeners/order-awaiting-refund-listener"
import { outboxPublisherWorker } from "./events/publishers/outbox-publisher-worker"
import "./queues/refund-queue"

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error("No JWT_KEY found!")

  if (!process.env.MONGO_URI)
    throw new Error("No MONGO_URI found!")

  if (!process.env.REDIS_HOST)
    throw new Error("No REDIS_HOST found!")

  if (!process.env.NATS_URL)
    throw new Error("No NATS_URL found!")

  if (!process.env.STRIPE_KEY)
    throw new Error("No STRIPE_KEY found!")

  if (!process.env.STRIPE_WEBHOOK_SECRET)
    throw new Error("No STRIPE_WEBHOOK_SECRET found!")

  try {
    // connect to NATS
    await natsWrapper.connect(process.env.NATS_URL)

    // Initiate listeners
    new OrderCreatedListener(natsWrapper.nc).listen()
    new OrderCanceledListener(natsWrapper.nc).listen()
    new OrderCompleteListener(natsWrapper.nc).listen()
    new OrderAwaitingRefundListener(natsWrapper.nc).listen()

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)

    // start outbox publisher worker
    outboxPublisherWorker()
    console.log("Connected to MongoDB")
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
}

start()
