import mongoose from "mongoose"
import { natsWrapper } from "./nats-wrapper"
import { UserCreatedListener } from "./events/listeners/user-created-listener"
import { OrderCompleteListener } from "./events/listeners/order-complete-listener"
import { OrderCanceledListener } from "./events/listeners/order-canceled-listener"
import "./queues/email-send-queue"
import { UserOtpRequestedListener } from "./events/listeners/user-otp-requested-listener"

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error("No JWT_KEY found!")

  if (!process.env.MONGO_URI)
    throw new Error("No MONGO_URI found!")

  if (!process.env.REDIS_HOST)
    throw new Error("No REDIS_HOST found!")

  // if (!process.env.GMAIL_USER)
  //   throw new Error("No GMAIL_USER found!")

  // if (!process.env.GOOGLE_APP_PASSWORD)
  //   throw new Error("No GOOGLE_APP_PASSWORD found!")

  if (!process.env.RESEND_API_KEY)
    throw new Error("No RESEND_API_KEY found!")

  if (!process.env.NATS_URL)
    throw new Error("No NATS_URL found!")

  try {
    // connect to NATS
    await natsWrapper.connect(process.env.NATS_URL)

    // Listen to events from other services
    new UserCreatedListener(natsWrapper.nc).listen()
    new OrderCompleteListener(natsWrapper.nc).listen()
    new OrderCanceledListener(natsWrapper.nc).listen()
    new UserOtpRequestedListener(natsWrapper.nc).listen()

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Connect to Redis
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()

