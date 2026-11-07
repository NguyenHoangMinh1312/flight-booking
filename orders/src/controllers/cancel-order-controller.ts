import { BadRequestError, RefundReason, UserRole } from "@mint1312-flight-booking/common";
import { Request, Response } from "express";
import { cancelOrder } from "../services/cancel-order-service";

export const cancelOrderController = async (
  req: Request,
  res: Response
) => {
  // input validation
  const { refundReason } = req.body
  const orderId = req.params.orderId
  const userRole = req.currentUser?.role
  const userId = req.currentUser?.id

  if (!Object.values(RefundReason).includes(refundReason))
    throw new BadRequestError("Invalid refund reason")

  if (typeof orderId !== "string")
    throw new BadRequestError("Invalid order ID")

  if (!userRole)
    throw new BadRequestError("User role is undefined")

  if (!userId)
    throw new BadRequestError("User ID is undefined")

  // customer cannot send FlightCanceled reason
  if (userRole === UserRole.Customer && refundReason === RefundReason.FlightCanceled)
    throw new BadRequestError("Invalid refund reason")

  // service
  await cancelOrder(orderId, userRole, userId, refundReason)

  res.send({ message: "Your order cancel request is being processed" })
}
