import { Ticket } from "@/app/types/ticket";

type Props = {
  ticket: Ticket | null;
  isOrdering: boolean;
  onOrder: () => void;
};

export default function OrderFooter({
  ticket,
  isOrdering,
  onOrder,
}: Props) {
  if (!ticket || ticket.orderId) return null;

  return (
    <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Ready to reserve seat{" "}
          <span className="font-bold text-slate-900 ">
            {ticket.seat.row}
            {String.fromCharCode(64 + ticket.seat.column)}
          </span>
          ?
        </p>

        <button
          type="button"
          onClick={onOrder}
          disabled={isOrdering}
          className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isOrdering ? "Ordering…" : "Order"}
        </button>
      </div>
    </footer>
  );
}