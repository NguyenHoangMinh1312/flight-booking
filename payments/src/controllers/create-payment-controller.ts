import { Request, Response } from "express"
import { CreatePaymentService } from "../services/create-payment-service"
import { stripeClient } from "../services/payment-clients/stripe-client"
import { BadRequestError } from "@mint1312-flight-booking/common"
import { PaymentIntent } from "stripe"

type ReqBody = {
  orderId: string
}

export const createPaymentController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const orderId = req.body.orderId
  const userId = req.currentUser?.id

  if (!userId)
    throw new BadRequestError("User ID not provided")

  const createPaymentService = new CreatePaymentService(stripeClient)
  const paymentIntent = await createPaymentService.pay(orderId, userId) as PaymentIntent

  res.status(201).send({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  })
}