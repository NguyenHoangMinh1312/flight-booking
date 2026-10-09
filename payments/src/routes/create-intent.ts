import express, { Request, Response } from "express"
import { body } from "express-validator"
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  UnauthorizedError,
  validateRequest,
} from "@mint1312-flight-booking/common"
import { Order } from "../models/order"
import { stripe } from "../stripe"

const router = express.Router()

router.post(
  "/api/payments/create-intent",
  requireAuth,
  [
    body("orderId")
      .not()
      .isEmpty()
      .withMessage("OrderId is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order)
      throw new NotFoundError()

    if (order.userId !== req.currentUser!.id)
      throw new UnauthorizedError()

    if (order.status != OrderStatus.Created)
      throw new BadRequestError("Cannot pay for this order")

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price,
      currency: "vnd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        userId: req.currentUser!.id,
      },
    })

    res.status(201).send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  }
)

export { router as createPaymentIntentRouter }
