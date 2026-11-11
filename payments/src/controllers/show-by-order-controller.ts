import { Request, Response } from "express"
import { BadRequestError, NotFoundError, UnauthorizedError, UserRole } from "@mint1312-flight-booking/common"
import { Payment } from "../models/payment"

type ReqParams = {
  orderId: string
}

export const showByOrderController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  const orderId = req.params.orderId
  const userId = req.currentUser?.id
  const userRole = req.currentUser?.role

  if (!userId)
    throw new BadRequestError("User ID not provided")

  if (!userRole)
    throw new BadRequestError("User role not provided")

  const payment = await Payment.findOne({ order: orderId }).populate("order")

  if (!payment)
    throw new NotFoundError()

  if (userRole === UserRole.Customer && payment.order.userId !== userId)
    throw new UnauthorizedError()

  res.send({
    provider: payment.provider,
    transactionId: payment.transactionId
  })
}