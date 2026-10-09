import mongoose from "mongoose"
import { Order } from "./order"
import { OrderStatus } from "@mint1312-flight-booking/common"
import { FlightStatus } from "@mint1312-flight-booking/common"

// interface that describes the properties to create a new ticket
interface TicketAttrs {
  id: string,
  version: number,
  price: number;
  class: string;
  status: FlightStatus,
  seat: {
    row: number;
    column: number;
  },
  departureDate: Date
}

// interface that describes the properties that a User model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>
}

// interface that describes the properties that User document has
export interface TicketDoc extends mongoose.Document {
  id: string,
  version: number,
  price: number,
  class: string,
  status: FlightStatus,
  seat: {
    row: number;
    column: number;
  },
  departureDate: Date,
  isReserved(): Promise<boolean>
}

// User model schema
const ticketSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true
    },
    class: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FlightStatus),
      required: true,
    },
    seat: {
      row: {
        type: Number,
        required: true,
      },
      column: {
        type: Number,
        required: true,
      }
    },
    departureDate: {
      type: Date,
      required: true
    }
  },
  {
    versionKey: "version",
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          version: ret.__v,
          price: ret.price,
          class: ret.class,
          status: ret.status,
          seat: ret.seat,
          departureDate: ret.departureDate
        }
      }
    }
  }
)

// create a ticket instance in the db
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    __v: attrs.version,
    price: attrs.price,
    class: attrs.class,
    status: attrs.status,
    seat: attrs.seat,
    departureDate: attrs.departureDate
  })
}

// check if an order is already reserved
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $nin: [OrderStatus.Canceled]
    }
  })

  return existingOrder ? true : false
}

// find the previous version (used when receiving ticket:updated event)
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  })
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema)

export { Ticket }
