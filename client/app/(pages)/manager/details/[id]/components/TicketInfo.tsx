import Link from "next/link";
import { Ticket } from "@/app/types/ticket";
import { currencyFormatter } from "@/app/utils/format-currency";

type Props = {
  ticket: Ticket | null;
};

const columnLabel = (column: number) =>
  String.fromCharCode(64 + column);

export default function TicketInfo({ ticket }: Props) {

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-live="polite"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
        Your selection
      </p>

      {!ticket ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-5 text-slate-600">
          Select an available seat to see its ticket details and place
          your order.
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Seat</p>

              <p className="mt-1 text-xl font-bold text-slate-900 ">
                {ticket.seat.row}
                {columnLabel(ticket.seat.column)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Class</p>

              <p className="mt-1 text-xl font-bold capitalize text-slate-900 ">
                {ticket.class}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Price</p>

              <p className="mt-1 text-xl font-bold text-slate-900 ">
                {currencyFormatter.format(ticket.price)}
              </p>
            </div>
          </div>

          {ticket.orderId && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <Link
                href={`/manager/orders/${ticket.orderId}`}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
              >
                View Order
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}