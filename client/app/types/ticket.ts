export type SeatClass = "first" | "business" | "economy";

export type Ticket = {
  id: string;
  price: number;
  class: SeatClass;
  seat: {
    row: number;
    column: number;
  };
  orderId?: string;
  departureDate?: string
};