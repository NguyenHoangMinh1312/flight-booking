import { FaPlane } from "react-icons/fa";
import { Flight } from "@/app/types/flight";
import { Ticket } from "@/app/types/ticket";
import { formatDateTime } from "@/app/utils/format-datetime";

type Props = {
  flight: Flight | null;
  ticket: Ticket;
};

export default function FlightDetailsCard({ flight, ticket }: Props) {
  const departureDateStr = flight?.departure?.date || ticket?.departureDate;
  const departure = formatDateTime(departureDateStr);
  const arrival = formatDateTime(flight?.arrival?.date);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-700">
          {flight?.flightNumber || "Flight Details"}
        </span>

        {departure.date !== "N/A" && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Departure Date:</span>
            <span className="font-medium text-slate-900">{departure.date}</span>
            {departure.time && <span>{departure.time}</span>}
          </div>
        )}
      </div>

      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        {flight?.description || "Flight Journey"}
      </h2>

      <div
        className="my-8 flex items-center gap-4 text-slate-400"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-slate-200" />
        <FaPlane className="text-xl text-sky-500" />
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Departure
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {flight?.departure?.airport || "Origin Airport"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span>{departure.date}</span>
            {departure.time && <span className="ml-2">{departure.time}</span>}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Arrival
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {flight?.arrival?.airport || "Destination Airport"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span>{arrival.date}</span>
            {arrival.time && <span className="ml-2">{arrival.time}</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
