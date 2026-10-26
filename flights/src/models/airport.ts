import mongoose from "mongoose";

// Interface describing attributes required to create an Airport
export interface AirportAttrs {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Interface describing the Airport model static methods
interface AirportModel extends mongoose.Model<AirportDoc> {
  build(attrs: AirportAttrs): AirportDoc;
}

// Interface describing the Airport document
export interface AirportDoc extends mongoose.Document {
  code: string;
  name: string;
  city: string;
  country: string;
}

const airportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
);

airportSchema.index({ code: 1 }, { unique: true });

airportSchema.statics.build = (attrs: AirportAttrs) => {
  return new Airport(attrs);
};

const Airport = mongoose.model<AirportDoc, AirportModel>("Airport", airportSchema);

export { Airport, airportSchema };