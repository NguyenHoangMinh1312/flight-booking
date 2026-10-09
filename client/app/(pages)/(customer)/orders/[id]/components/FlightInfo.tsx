import { FaPlane, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Flight } from "@/app/types/flight";
import { formatDateTime } from "@/app/utils/format-datetime";

type FlightInfoProps = {
  flight: Flight | null;
  fallbackDepartureDate?: string;
};

export default function FlightInfo({ flight, fallbackDepartureDate }: FlightInfoProps) {
  const departureDateStr = flight?.departure?.date || fallbackDepartureDate;
  const departure = formatDateTime(departureDateStr);
  const arrival = formatDateTime(flight?.arrival?.date);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FaPlane className="text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Flight Information</h2>
          </div>
        </div>

        {flight?.flightNumber ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 border border-sky-200">
            {flight.flightNumber}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {flight?.description || "Flight Details"}
        </h3>

        {/* Departure -> Arrival Route Visual */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Departure Card */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5 transition hover:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600">
              <FaPlaneDeparture className="text-sm" />
              <span>Departure</span>
            </div>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {flight?.departure?.airport || "Departure Airport"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <FaCalendarAlt className="text-slate-400" />
                {departure.date}
              </span>
              {departure.time && (
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <FaClock className="text-slate-400" />
                  {departure.time}
                </span>
              )}
            </div>
          </div>

          {/* Arrival Card */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5 transition hover:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              <FaPlaneArrival className="text-sm" />
              <span>Arrival</span>
            </div>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {flight?.arrival?.airport || "Arrival Airport"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <FaCalendarAlt className="text-slate-400" />
                {arrival.date}
              </span>
              {arrival.time && (
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <FaClock className="text-slate-400" />
                  {arrival.time}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
