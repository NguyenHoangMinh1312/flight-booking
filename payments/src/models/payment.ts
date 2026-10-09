import mongoose from "mongoose"

// interface that describes the properties to create a new payment
interface PaymentAttrs {
  orderId: string,
  stripeId: string,
  isRefund?: boolean
}

// interface that describes the properties that a payment model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc
}

// interface that describes the properties that payment document has
interface PaymentDoc extends mongoose.Document {
  id: string,
  version: number,
  orderId: string,
  stripeId: string,
  isRefund: boolean
}

// payment model schema
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    stripeId: {
      type: String,
      required: true
    },
    isRefund: {
      type: Boolean,
      default: false
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
          orderId: ret.orderId,
          stripeId: ret.stripeId,
          isRefund: ret.isRefund
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
