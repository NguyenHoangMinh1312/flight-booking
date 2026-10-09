import Link from "next/link";
import {
  FaCalendarAlt,
  FaChair,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaReceipt,
  FaTimesCircle,
  FaUndoAlt,
} from "react-icons/fa";
import { Order } from "@/app/types/order";
import { currencyFormatter } from "@/app/utils/format-currency";
import { formatDateTime } from "@/app/utils/format-datetime";
import { columnLabel } from "@/app/utils/column-label";

type OrderCardProps = {
  order: Order;
};

function getStatusDetails(status: string) {
  switch (status.toLowerCase()) {
    case "complete":
      return {
        label: "Complete",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <FaCheckCircle className="text-emerald-500" />,
      };
    case "created":
      return {
        label: "Created",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <FaClock className="text-amber-500" />,
      };
    case "awaiting_refund":
      return {
        label: "Awaiting Refund",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <FaUndoAlt className="text-purple-500" />,
      };
    case "canceled":
      return {
        label: "Canceled",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <FaTimesCircle className="text-rose-500" />,
      };
    case "refund-failed":
      return {
        label: "Refund failed",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <FaTimesCircle className="text-rose-500" />,
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        icon: <FaClock className="text-slate-500" />,
      };
  }
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusDetails = getStatusDetails(order.status);
  const ticket = order.ticket;
  const departure = formatDateTime(ticket?.departureDate);

  const seatText =
    ticket?.seat && ticket.seat.row && ticket.seat.column
      ? `Seat ${ticket.seat.row}${columnLabel(ticket.seat.column)}`
      : "Seat Unassigned";

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Order Ref & Ticket Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <FaReceipt className="text-slate-400" />
              Order #{order.id.slice(-8)}
            </span>

            {ticket?.class && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">
                {ticket.class} class
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
            {/* Seat Info */}
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <FaChair className="text-sky-600" />
              <span>{seatText}</span>
            </div>

            {/* Departure Info */}
            <div className="flex items-center gap-2 text-slate-600">
              <FaCalendarAlt className="text-slate-400" />
              <span>
                {departure.date}
                {departure.time && ` • ${departure.time}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge, Price & Arrow */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end sm:gap-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusDetails.badgeClass}`}
          >
            {statusDetails.icon}
            <span>{statusDetails.label}</span>
          </span>

          {/* Price & Action */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold text-slate-900 sm:text-lg">
                {ticket?.price !== undefined
                  ? currencyFormatter.format(ticket.price)
                  : "N/A"}
              </p>
            </div>

            <div className="hidden rounded-full p-2 text-slate-400 transition group-hover:bg-sky-50 group-hover:text-sky-600 sm:block">
              <FaChevronRight className="text-sm transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
