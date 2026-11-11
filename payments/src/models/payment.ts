import mongoose from "mongoose"
import { OrderDoc } from "./order"

export enum PaymentProvider {
  Stripe = "Stripe",
}

// interface that describes the properties to create a new payment
interface PaymentAttrs {
  order: OrderDoc,
  provider: PaymentProvider,
  transactionId: string,
}

// interface that describes the properties that a payment model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc
}

// interface that describes the properties that payment document has
interface PaymentDoc extends mongoose.Document {
  id: string,
  version: number,
  order: OrderDoc,
  provider: PaymentProvider,
  transactionId: string,
}

// payment model schema
const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
  },
  {
    versionKey: "version",
    optimisticConcurrency: true,
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          version: ret.__v,
          order: ret.order,
          provider: ret.provider,
          transactionId: ret.transactionId
        }
      }
    }
  }
)

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs)
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>("Payment", paymentSchema)

export { Payment }
