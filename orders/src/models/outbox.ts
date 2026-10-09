import mongoose from "mongoose"

// interface that describes the properties to create a new outbox
interface OutboxAttrs {
  eventType: string,
  payload: Record<string, any>
}

// interface that describes the properties that a Outbox model has
interface OutboxModel extends mongoose.Model<OutboxDoc> {
  build(attrs: OutboxAttrs): OutboxDoc
}

// interface that describes the properties that Outbox document has
export interface OutboxDoc extends mongoose.Document {
  eventType: string,
  payload: Record<string, any>,
  createdAt: Date
}

// Outbox model schema
const outboxSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

// indexing for faster lookup
outboxSchema.index({ createdAt: 1 })

outboxSchema.statics.build = (attrs: OutboxAttrs) => {
  return new Outbox(attrs)
}

const Outbox = mongoose.model<OutboxDoc, OutboxModel>("Outbox", outboxSchema)

export { Outbox }