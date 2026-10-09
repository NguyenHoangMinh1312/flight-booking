import { BadRequestError, FlightStatus, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@mint1312-flight-booking/common"
import express, { Request, Response } from "express"
import { body } from "express-validator"
import { Ticket } from "../models/ticket"
import { Order } from "../models/order"
import mongoose from "mongoose"
import { expirationQueue } from "../queues/expiration-queue"
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher"

const router = express.Router()

const EXPIRATION_WINDOW = 15 * 60    // order expires after 15 mins
const LATEST_ORDER_WINDOW = 3 * 60 * 60 * 1000  // user can only order a ticket in latest 3 hour before the departure time

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not().isEmpty()
      .withMessage("ticketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // Find the ticket that the user wants to order
    const ticket = await Ticket.findById(ticketId)

    if (!ticket)
      throw new NotFoundError()

    if (ticket.status === FlightStatus.Canceled)
      throw new BadRequestError("The flight associatd with this ticket is canceled")

    // check for the order time 
    const departureDate = new Date(ticket.departureDate)
    const minimumBookingTime = new Date(Date.now() + LATEST_ORDER_WINDOW)
    if (departureDate < minimumBookingTime)
      throw new BadRequestError("Tickets cannot be ordered less than 3 hours before departure");

    // Check if the ticket has already been reserved
    const isReserved = await ticket.isReserved()
    if (isReserved)
      throw new BadRequestError("Ticket is already reserved")

    // Calculate the expiration time for the order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW)

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // save order to db
      const order = Order.build({
        userId: req.currentUser!.id,
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

      // response
      res.status(201).send(order)

    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
)

export { router as newOrderRouter }