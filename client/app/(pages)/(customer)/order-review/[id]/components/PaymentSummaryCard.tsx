import { FaLock } from "react-icons/fa";
import { FaCcStripe } from "react-icons/fa6";
import { Ticket } from "@/app/types/ticket";
import { currencyFormatter } from "@/app/utils/format-currency";

type Props = {
  ticket: Ticket;
  isComplete: boolean;
  isExpired: boolean;
  onOpenPayment: () => void;
};

export default function PaymentSummaryCard({
  ticket,
  isComplete,
  isExpired,
  onOpenPayment,
}: Props) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Payment Summary</h3>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>1x {ticket.class} Ticket</span>
          <span className="font-semibold text-slate-900">
            {currencyFormatter.format(ticket.price)}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Taxes & Fees</span>
          <span className="font-semibold text-slate-900">Included</span>
        </div>

        <div className="border-t border-slate-200 pt-4 flex justify-between text-base font-bold text-slate-900">
          <span>Total Due</span>
          <span className="text-indigo-600">
            {currencyFormatter.format(ticket.price)}
          </span>
        </div>
      </div>

      {!isComplete && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenPayment}
            disabled={isExpired}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaCcStripe className="text-xl" />
            <span>Pay with Stripe</span>
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <FaLock className="text-slate-400" />
            <span>Secure 256-bit SSL Payment</span>
          </div>
        </div>
      )}
    </aside>
  );
}
