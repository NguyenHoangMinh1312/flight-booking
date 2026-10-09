import { NotFoundError, requireAuth, UnauthorizedError } from "@mint1312-flight-booking/common"
import express, { Request, Response } from "express"
import { Order } from "../models/order"
import { UserRole } from "@mint1312-flight-booking/common"

const router = express.Router()

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket")

    if (!order)
      throw new NotFoundError()

    if (req.currentUser!.role === UserRole.Customer && order.userId !== req.currentUser!.id)
      throw new UnauthorizedError()

    res.send(order)
  }
)

export { router as showOrderRouter }