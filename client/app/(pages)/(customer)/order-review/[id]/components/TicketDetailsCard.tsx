import { FaTicketAlt, FaTag } from "react-icons/fa";
import { Ticket } from "@/app/types/ticket";
import { columnLabel } from "@/app/utils/column-label";
import { currencyFormatter } from "@/app/utils/format-currency";

type Props = {
  ticket: Ticket;
  status: string;
};

export default function TicketDetailsCard({ ticket, status }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-2">
        <FaTicketAlt className="text-sky-600" />
        <h3 className="text-lg font-bold text-slate-900">
          Ticket & Seat Details
        </h3>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-5 border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Assigned Seat
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {ticket.seat.row}
            {columnLabel(ticket.seat.column)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5 border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Seat Class
          </p>
          <p className="mt-2 text-xl font-bold capitalize text-slate-900">
            {ticket.class} Class
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5 border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Ticket Price
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {currencyFormatter.format(ticket.price)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <FaTag className="text-slate-400" />
          Ticket Reference ID:{" "}
          <code className="font-mono text-slate-700">{ticket.id}</code>
        </span>
        <span>
          Status:{" "}
          <strong className="capitalize text-slate-700">{status}</strong>
        </span>
      </div>
    </section>
  );
}
