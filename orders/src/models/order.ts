import mongoose from "mongoose"
import { OrderStatus } from "@mint1312-flight-booking/common"
import { TicketDoc } from "./ticket"

// interface that describes the properties to create a new order
interface OrderAttrs {
  userId: string,
  status: OrderStatus,
  expiresAt: Date,
  ticket: TicketDoc
}

// interface that describes the properties that a Order model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

// interface that describes the properties that User document has
export interface OrderDoc extends mongoose.Document {
  id: string,
  version: number,
  userId: string,
  status: OrderStatus,
  createdAt: Date,
  expiresAt: Date,
  ticket: TicketDoc
}

// User model schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket"
    }
  },
  {
    timestamps: true,
    versionKey: "version",
    optimisticConcurrency: true,
    toJSON: {
      transform(_doc, ret: any) {
        return {
          id: ret._id,
          version: ret.__v,
          userId: ret.userId,
          status: ret.status,
          expiresAt: ret.expiresAt,
          createdAt: ret.createdAt,
          ticket: ret.ticket
        }
      }
    }
  }
)

// enforce only 1 order per ticket that in Created / Awaiting Refund / Complete / Refund failed status
orderSchema.index(
  {
    ticket: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [OrderStatus.Created, OrderStatus.AwaitingRefund, OrderStatus.Complete, OrderStatus.RefundFailed]
      }
    }
  }
)

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs)
}

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema)

export { Order }
