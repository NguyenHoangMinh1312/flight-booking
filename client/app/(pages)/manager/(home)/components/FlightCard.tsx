import { FaCheckCircle, FaPlane, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";
import { Flight } from "@/app/types/flight";
import { formatDateTime } from "@/app/utils/format-datetime";
import { currencyFormatter } from "@/app/utils/format-currency";

type FlightCardProps = { flight: Flight };

// get the corresponding style base on the flight status
function getStatusDetails(status?: string) {
  const isCanceled = status?.toLowerCase() === "canceled"

  if (isCanceled) {
    return {
      label: "Canceled",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <FaTimesCircle className="text-rose-500 shrink-0" />,
    };
  }

  return {
    label: "Available",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <FaCheckCircle className="text-emerald-500 shrink-0" />,
  };
}

export default function FlightCard({ flight }: FlightCardProps) {
  const departure = formatDateTime(flight.departure.date);
  const arrival = formatDateTime(flight.arrival.date);
  const economyPrice = flight.priceConfig?.economy;
  const statusDetails = getStatusDetails(flight.status);

  return (
    <Link href={`/manager/details/${flight.id}`}
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            {flight.flightNumber}
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {flight.description}
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shrink-0 ${statusDetails.badgeClass}`}
        >
          {statusDetails.icon}
          <span>{statusDetails.label}</span>
        </span>
      </div>
      <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {flight.departure.airport}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            <span className="block">
              {departure.date}
            </span>
            {departure.time &&
              <span className="block">
                {departure.time}
              </span>}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-300" aria-hidden="true">
          <span className="h-px w-6 bg-slate-900" />
          <FaPlane className="text-sky-600" />
          <span className="h-px w-6 bg-slate-900" />
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">
            {flight.arrival.airport}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            <span className="block">{arrival.date}</span>
            {arrival.time &&
              <span className="block">
                {arrival.time}
              </span>
            }
          </p>
        </div>
      </div>
      <div className="mt-auto border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          From
        </p>
        <p className="mt-1 text-lg font-bold text-slate-900">
          {economyPrice === undefined ?
            "Contact for price" :
            currencyFormatter.format(economyPrice)}
        </p>
      </div>
    </Link>
  );
}
