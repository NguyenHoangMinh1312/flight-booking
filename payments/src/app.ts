import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError, currentUser } from "@mint1312-flight-booking/common"
import { createPaymentRouter } from "./routes/new"
import { stripeWebhookRouter } from "./routes/stripe-webhook"
import { showByOrderRouter } from "./routes/show-by-order"
import { confirmStripePaymentRouter } from "./routes/confirm-stripe-payment"

const app = express()
app.set("trust proxy", true)

// Raw body parser specifically for Stripe webhook signature verification
app.use(
  "/api/payments/stripe-webhook",
  express.raw({ type: "application/json" })
)

// Standard JSON body parser for other endpoints
app.use(json())

app.use(cookieSession({
  signed: false,
  httpOnly: true,
  secure: false,   // in deployment, turn it to true 
  // sameSite: "none",   // uncomment this line if deployment
}));

app.use(currentUser)

// routers
app.use(confirmStripePaymentRouter)
app.use(stripeWebhookRouter)
app.use(createPaymentRouter)
app.use(showByOrderRouter)

app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }