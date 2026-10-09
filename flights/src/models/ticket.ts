import mongoose from "mongoose"
import { FlightClass, FlightDoc } from "./flight"
import { FlightStatus } from "@mint1312-flight-booking/common"

// interface that describes the properties to create a new ticket
interface TicketAttrs {
  flight: FlightDoc,
  price: number,
  class: FlightClass,
  status: FlightStatus,
  seat: {
    row: number,
    column: number
  },
  orderId?: string
}

// interface that describes the properties that a Ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

// interface that describes the properties that Ticket document has
export interface TicketDoc extends mongoose.Document {
  id: string,
  version: number,
  flight: FlightDoc,
  price: number,
  class: FlightClass,
  status: FlightStatus,
  seat: {
    row: number,
    column: number
  },
  orderId?: string
}

// User model schema
const ticketSchema = new mongoose.Schema(
  {
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight"
    },
    price: {
      type: Number,
      required: true,
    },
    class: {
      type: String,
      enum: Object.values(FlightClass),
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
      },
    },
    orderId: {
      type: String,
    }
  },
  {
    versionKey: "version",
    optimisticConcurrency: true,
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          version: ret.__v,
          flight: ret.flight,
          price: ret.price,
          class: ret.class,
          status: ret.status,
          seat: ret.seat,
          orderId: ret.orderId,
        }
      }
    }
  }
)

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema)

export { Ticket }
