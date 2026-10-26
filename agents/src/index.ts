import mongoose from "mongoose"
import { app } from "./app"
import { natsWrapper } from "./nats-wrapper"
import { UserCreatedListener } from "./events/listeners/user-created-listener"

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error("No JWT_KEY found!")

  if (!process.env.MONGO_URI)
    throw new Error("No MONGO_URI found!")

  if (!process.env.NATS_URL)
    throw new Error("No NATS_URL found!")

  if (!process.env.OPENAI_API_KEY)
    throw new Error("No OPENAI_API_KEY found!")

  if (!process.env.FLIGHTS_SRV_URL)
    throw new Error("No FLIGHTS_SRV_URL found!")

  if (!process.env.ORDERS_SRV_URL)
    throw new Error("No ORDERS_SRV_URL found!")

  try {
    // connect to NATS
    await natsWrapper.connect(process.env.NATS_URL)

    // connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // start the listeners
    new UserCreatedListener(natsWrapper.nc).listen()

  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
}

start()
