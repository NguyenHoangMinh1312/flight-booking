export type FlightStatus = "available" | "canceled"
import { SeatClass } from "./ticket";

export type ClassConfig = {
  class: SeatClass,
  fromRow: number,
  toRow: number,
  columns: number,
  price: number
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
  rows: number;
  classConfig: ClassConfig[];
  status: FlightStatus;
};

