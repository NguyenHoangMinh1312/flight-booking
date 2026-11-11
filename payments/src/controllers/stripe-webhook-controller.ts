import { Request, Response } from "express";
import { stripeClient } from "../services/payment-clients/stripe-client";
import { handleStripeWebhook } from "../services/stripe-webhook-service";

export const stripeWebhookController = async (
  req: Request,
  res: Response
) => {
  // extract stripe signature
  const sig = req.headers["stripe-signature"]

  if (!sig)
    return res.status(400).send({ error: "Missing stripe-signature header" })

  let event
  try {
    event = stripeClient.getWebhooks(req.body, sig)
  } catch (err: any) {
    return res.status(400).send({ error: err.message || "Invalid signature" })
  }

  const { status, error } = await handleStripeWebhook(event)

  if (error)
    res.status(status).send({ error })
  else
    res.status(status).send({ received: true })
}
