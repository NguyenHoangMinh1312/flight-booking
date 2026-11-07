import { NotFoundError, BadRequestError, FlightStatus, OrderStatus } from "@mint1312-flight-booking/common"
import { Ticket } from "../models/ticket"
import { Order } from "../models/order"
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher"
import { expirationQueue } from "../queues/expiration-queue"
import mongoose from "mongoose"

const EXPIRATION_WINDOW = 15 * 60    // order payment expires after 15 mins
const LATEST_ORDER_WINDOW = 3 * 60 * 60 * 1000  // user can only order a ticket in latest 3 hour before the departure time

export const createOrder = async (
  ticketId: string,
  userId: string
) => {
  // find the ticket
  const ticket = await Ticket.findById(ticketId)

  if (!ticket)
    throw new NotFoundError()

  if (ticket.status === FlightStatus.Canceled)
    throw new BadRequestError("The flight associatd with this ticket is canceled")

  const isReserved = await ticket.isReserved()
  if (isReserved)
    throw new BadRequestError("Ticket is already reserved")

  const departureDate = new Date(ticket.departureDate)
  const minimumBookingTime = new Date(Date.now() + LATEST_ORDER_WINDOW)
  if (departureDate < minimumBookingTime)
    throw new BadRequestError("Tickets cannot be ordered less than 3 hours before departure");

  // Calculate the payment expiration time for the order
  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW)

  // save the order
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const order = Order.build({
      userId,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    })
    await order.save({ session })

    // save event to outbox
    const outboxEvent = OrderCreatedPublisher.buildOutboxEvent({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    })
    await outboxEvent.save({ session })

    // send the order to expiration queue
    await expirationQueue.add(
      { orderId: order.id },
      { delay: new Date(order.expiresAt).getTime() - new Date().getTime() }
    )

    // commit db transacrion
    await session.commitTransaction()

    return order
  } catch (err) {
    await session.abortTransaction();
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}