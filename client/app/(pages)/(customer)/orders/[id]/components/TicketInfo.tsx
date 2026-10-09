import { FaTicketAlt, FaChair } from "react-icons/fa";
import { Ticket } from "@/app/types/ticket";
import { columnLabel } from "@/app/utils/column-label";
import { currencyFormatter } from "@/app/utils/format-currency";

type TicketInfoProps = {
  ticket: Ticket;
};

export default function TicketInfo({ ticket }: TicketInfoProps) {
  const seatDisplay =
    ticket?.seat && ticket.seat.row && ticket.seat.column
      ? `${ticket.seat.row}${columnLabel(ticket.seat.column)}`
      : "Unassigned";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FaTicketAlt className="text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ticket Information</h2>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Seat */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaChair className="text-sky-600" />
            <span>Seat</span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{seatDisplay}</p>
        </div>

        {/* Class */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Class
          </p>
          <p className="mt-2 text-2xl font-bold capitalize text-slate-900">
            {ticket?.class ? `${ticket.class} Class` : "N/A"}
          </p>
        </div>

        {/* Price */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Price
          </p>
          <p className="mt-2 text-2xl font-bold text-sky-700">
            {ticket?.price !== undefined
              ? currencyFormatter.format(ticket.price)
              : "N/A"}
          </p>
        </div>

        {/* Ticket ID */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ticket ID
          </p>
          <p className="mt-2 font-mono text-sm font-bold text-slate-900 break-all">
            {ticket?.id ?? "N/A"}
          </p>
        </div>
      </div>
    </section>
  );
}
