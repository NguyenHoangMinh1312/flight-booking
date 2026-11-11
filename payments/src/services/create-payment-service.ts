import { IPaymentClient } from "./payment-clients/payment-client-interface";
import { Order } from "../models/order";
import { NotFoundError, UnauthorizedError, BadRequestError, OrderStatus } from "@mint1312-flight-booking/common";

export class CreatePaymentService {
  private client: IPaymentClient

  constructor(client: IPaymentClient) {
    this.client = client
  }

  public async pay(orderId: string, userId: string) {
    // validate order
    const order = await Order.findById(orderId)

    if (!order)
      throw new NotFoundError()

    if (order.userId !== userId)
      throw new UnauthorizedError()

    if (order.status != OrderStatus.Created)
      throw new BadRequestError("Cannot pay for this order")

    // create payment
    const paymentData = await this.client.pay(
      order.price,
      "vnd",
      orderId,
      { userId }
    )

    return paymentData
  }
}