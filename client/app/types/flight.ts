import { SeatClass } from "./ticket";
import { Airport } from "./airport";

export enum FlightStatus {
  Available = "available",
  Canceled = "canceled"
}

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
    airport: Airport;
    date: string;
  };
  arrival: {
    airport: Airport;
    date: string;
  };
  rows: number;
  classConfig: ClassConfig[];
  status: FlightStatus;
};

