import {
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUndoAlt,
  FaUser,
  FaHourglassEnd,
} from "react-icons/fa";
import { Order } from "@/app/types/order";
import { formatDateTime } from "@/app/utils/format-datetime";

type OrderInfoProps = {
  order: Order;
};

function getOrderStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "complete":
      return {
        label: "Complete",
        description: "Payment has been processed successfully.",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <FaCheckCircle className="text-emerald-500" />,
      };
    case "created":
      return {
        label: "Created",
        description: "Order placed. Awaiting customer payment.",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <FaClock className="text-amber-500" />,
      };
    case "awaiting-refund":
    case "awating-refund":
    case "awaiting_refund":
      return {
        label: "Awaiting Refund",
        description: "Your refund request is being processed.",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <FaUndoAlt className="text-purple-500" />,
      };
    case "canceled":
    case "cancelled":
      return {
        label: "Canceled",
        description: "This order has been canceled.",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <FaTimesCircle className="text-rose-500" />,
      };
    default:
      return {
        label: status,
        description: "Order status information.",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        icon: <FaClock className="text-slate-500" />,
      };
  }
}

export default function OrderInfo({ order }: OrderInfoProps) {
  const statusConfig = getOrderStatusConfig(order.status);
  const creationTime = formatDateTime(order.createdAt);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FaReceipt className="text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Order Information</h2>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold ${statusConfig.badgeClass}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Order ID */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaReceipt className="text-slate-400" />
            <span>Order ID</span>
          </div>
          <p className="mt-2 font-mono text-sm font-bold text-slate-900 break-all">
            {order.id}
          </p>
        </div>

        {/* Customer User ID */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaUser className="text-slate-400" />
            <span>User ID</span>
          </div>
          <p className="mt-2 font-mono text-sm font-bold text-slate-900 break-all">
            {order.userId}
          </p>
        </div>

        {/*Creation time */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaHourglassEnd className="text-slate-400" />
            <span>Created At</span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {creationTime.date}
            {creationTime.time && ` • ${creationTime.time}`}
          </p>
          <p className="mt-1 text-xs text-slate-500">{statusConfig.description}</p>
        </div>
      </div>
    </section>
  );
}
