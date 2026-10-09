import mongoose from "mongoose"

// interface that describes the properties to create a new otp
interface OtpAttrs {
  email: string,
  otp: string,
  expiresAt: Date,
  lastSentAt: Date,
}

// interface that describes the properties that a Otp model has
interface OtpModel extends mongoose.Model<OtpDoc> {
  build(attrs: OtpAttrs): OtpDoc
}

// interface that describes the properties that User document has
interface OtpDoc extends mongoose.Document {
  id: string
  email: string,
  otp: string,
  expiresAt: Date,
  attempts: number,
  lastSentAt: Date
}

// User model schema
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastSentAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)

// Automatically delete the expired OTP
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

otpSchema.statics.build = (attrs: OtpAttrs) => {
  return new Otp(attrs)
}

const Otp = mongoose.model<OtpDoc, OtpModel>("Otp", otpSchema)

export { Otp }
