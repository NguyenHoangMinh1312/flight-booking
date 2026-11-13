import mongoose from "mongoose"
import { FlightStatus } from "@mint1312-flight-booking/common"

export enum FlightClass {
  First = "first",
  Business = "business",
  Economy = "economy"
}

// interface that describes the properties to create a new Flight
interface FlightAttrs {
  flightNumber: string,
  description?: string,
  departure: {
    airport: string,
    date: Date
  },
  arrival: {
    airport: string,
    date: Date
  },
  rows: number,
  classConfig: {
    class: FlightClass,
    fromRow: number,
    toRow: number,
    columns: number,
    price: number,
  }[],
  status?: FlightStatus
}

// interface that describes the properties that Flight document has
export interface FlightDoc extends mongoose.Document {
  id: string,
  flightNumber: string,
  description?: string,
  departure: {
    airport: string,
    date: Date
  },
  arrival: {
    airport: string,
    date: Date
  },
  rows: number,
  classConfig: {
    class: FlightClass,
    fromRow: number,
    toRow: number,
    columns: number,
    price: number
  }[],
  status: FlightStatus
}

// Flight model schema
const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    departure: {
      airport: {
        type: String,
        required: true,
        ref: "Airport"
      },
      date: {
        type: Date,
        required: true,
      },
    },
    arrival: {
      airport: {
        type: String,
        required: true,
        ref: "Airport"
      },
      date: {
        type: Date,
        required: true,
      },
    },
    rows: {
      type: Number,
      required: true,
    },
    classConfig: [
      {
        class: {
          type: String,
          enum: Object.values(FlightClass),
          required: true
        },
        fromRow: {
          type: Number,
          required: true
        },
        toRow: {
          type: Number,
          required: true
        },
        columns: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    status: {
      type: String,
      enum: Object.values(FlightStatus),
      default: FlightStatus.Available
    }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          version: ret.__v,
          flightNumber: ret.flightNumber,
          description: ret.description,
          departure: ret.departure,
          arrival: ret.arrival,
          rows: ret.rows,
          classConfig: ret.classConfig,
          status: ret.status
        }
      }
    }
  }
)

flightSchema.statics.build = (attrs: FlightAttrs) => {
  return new Flight(attrs)
}

// interface that describes the properties that a Flight model has
interface FlightModel extends mongoose.Model<FlightDoc> {
  build(attrs: FlightAttrs): FlightDoc
}

const Flight = mongoose.model<FlightDoc, FlightModel>("Flight", flightSchema)

export { Flight }
