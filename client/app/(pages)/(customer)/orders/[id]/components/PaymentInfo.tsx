import {
  FaCreditCard,
  FaReceipt,
  FaCheckCircle,
} from "react-icons/fa";
import { Payment } from "@/app/types/payment";

type PaymentInfoProps = {
  payment: Payment | null;
};

export default function PaymentInfo({ payment }: PaymentInfoProps) {
  if (!payment) {
    return null;
  }

  const providerName =
    payment.provider.toLowerCase() === "stripe"
      ? "Stripe"
      : payment.provider.charAt(0).toUpperCase() + payment.provider;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FaCreditCard className="text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Payment Information
            </h2>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
          <FaCheckCircle className="text-emerald-500" />
          <span>Paid</span>
        </span>
      </div>

      {/* Details Grid */}
      <div className="mt-6 grid gap-4 grid-cols-2">
        {/* Payment Provider / Method */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaCreditCard className="text-slate-400" />
            <span>Payment Method</span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {providerName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Credit / Debit Card via {providerName}
          </p>
        </div>

        {/* Transaction ID */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaReceipt className="text-slate-400" />
            <span>Transaction ID</span>
          </div>
          <p className="mt-2 font-mono text-sm font-bold text-slate-900 break-all">
            {payment.transactionId}
          </p>
        </div>
      </div>
    </section>
  );
}
