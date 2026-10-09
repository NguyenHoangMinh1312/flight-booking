import { FaPlane } from "react-icons/fa";
import { Flight } from "@/app/types/flight";
import { formatDateTime } from "@/app/utils/format-datetime";

type Props = {
  flight: Flight;
};

export default function FlightInfo({ flight }: Props) {
  const departure = formatDateTime(flight.departure.date);
  const arrival = formatDateTime(flight.arrival.date);

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm lg:sticky lg:top-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
        {flight.flightNumber}
      </p>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        {flight.description}
      </h1>

      <div
        className="my-7 flex items-center gap-3 text-slate-400"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-slate-200" />
        <FaPlane className="text-sky-500" />
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Departure
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {flight.departure.airport}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            <span className="block">{departure.date}</span>
            <span className="block">{departure.time}</span>
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Arrival
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {flight.arrival.airport}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            <span className="block">{arrival.date}</span>
            <span className="block">{arrival.time}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}