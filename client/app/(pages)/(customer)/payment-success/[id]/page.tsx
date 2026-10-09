"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { FaCheckCircle, FaHome, FaTicketAlt } from "react-icons/fa";

function PaymentSuccessContent() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
          <FaCheckCircle className="h-10 w-10 text-emerald-600" />
        </div>

        {/* Heading */}
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">
          Payment Successful!
        </h1>

        {/* Order Reference if present */}
        {id && (
          <p className="mt-2 text-xs font-medium text-slate-500">
            Order Reference: <span className="font-mono font-semibold text-slate-700">#{id.slice(-8)}</span>
          </p>
        )}

        {/* Main message */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3 text-base text-slate-700">
          Thank you for the payment. Enjoy your flight.
        </div>

        {/* Call to action buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
          >
            <FaTicketAlt className="text-sm" />
            <span>View Order</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <FaHome className="text-sm text-slate-500" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
