import mongoose from "mongoose"
import { OrderStatus } from "@mint1312-flight-booking/common"

// interface that describes the properties to create a new order
interface OrderAttrs {
  id: string,
  version: number,
  userId: string,
  status: OrderStatus,
  price: number
}

// interface that describes the properties that a Order model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
  findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>
}

// interface that describes the properties that User document has
interface OrderDoc extends mongoose.Document {
  id: string,
  version: number,
  userId: string,
  status: OrderStatus,
  price: number
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
    },
    price: {
      type: Number,
      required: true
    },
  },
  {
    versionKey: "version",
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          version: ret.__v,
          userId: ret.userId,
          status: ret.status,
          price: ret.price
        }
      }
    }
  }
)

orderSchema.statics.build = (attrs: OrderAttrs) => {
  const order = new Order({
    _id: attrs.id,
    __v: attrs.version,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price
  })

  return order
}

// find the previous version (used when receiving order:canceled event)
orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema)

export { Order }
