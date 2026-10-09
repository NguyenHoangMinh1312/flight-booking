export type FlightStatus = "available" | "canceled"

export type SeatClass = {
  class: string;
  fromRow: number;
  toRow: number;
  _id?: string;
};

export type SeatConfig = {
  rows: number;
  columns: number;
  classes: SeatClass[];
};

export type PriceConfig = {
  first?: number;
  business?: number;
  economy?: number;
};

export type Flight = {
  id: string;
  version?: number;
  flightNumber: string;
  description: string;
  departure: {
    airport: string;
    date: string;
  };
  arrival: {
    airport: string;
    date: string;
  };
  seatConfig?: SeatConfig;
  priceConfig?: PriceConfig;
  status: FlightStatus;
};

