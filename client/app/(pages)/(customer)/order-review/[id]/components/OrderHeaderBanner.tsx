import Link from "next/link";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { Order } from "@/app/types/order";
import { formatCountdown } from "@/app/utils/format-countdown";

type Props = {
  order: Order;
  isComplete: boolean;
  isExpired: boolean;
  timeLeft: number | null;
};

export default function OrderHeaderBanner({
  order,
  isComplete,
  isExpired,
  timeLeft,
}: Props) {
  return (
    <div className="border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition flex items-center gap-1">
                <FaArrowLeft /> Flights
              </Link>
              <span>/</span>
              <span>Reservation Review</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {isComplete ? "Booking Confirmed!" : "Review Your Reservation"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Order #{order.id.slice(-8)}
            </span>

            {isComplete ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                <FaCheckCircle className="text-emerald-600" /> Payment Complete
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1.5 text-xs font-semibold text-red-700">
                <FaExclamationTriangle /> Expiration Notice
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-amber-800">
                <FaClock className="text-amber-600 animate-pulse" /> Seat Reserved
              </span>
            )}
          </div>
        </div>

        {/* Success Banner if Completed */}
        {isComplete && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-900 shadow-xs">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-2xl text-emerald-600" />
              <div>
                <h3 className="font-bold text-emerald-950 text-base">
                  Thank you! Your flight booking has been confirmed.
                </h3>
                <p className="text-xs text-emerald-700">
                  A confirmation email has been sent. Your seat assignment is guaranteed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expiration Timer Banner if pending */}
        {!isComplete && !isExpired && timeLeft !== null && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-amber-900">
            <div className="flex items-center gap-3">
              <FaClock className="text-amber-600 text-lg animate-pulse" />
              <div>
                <p className="text-sm font-medium">
                  Seat reserved! Please complete payment with Stripe before your reservation expires.
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-lg font-bold text-amber-700">
              {formatCountdown(timeLeft)}
            </div>
          </div>
        )}

        {!isComplete && isExpired && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-red-800">
            <FaExclamationTriangle className="text-red-500 text-lg" />
            <p className="text-sm font-medium">
              This order reservation has expired. Please select a seat again from the flight schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
