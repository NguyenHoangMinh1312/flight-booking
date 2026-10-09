"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaUndoAlt, FaRedo, FaCreditCard, FaSpinner } from "react-icons/fa";
import { Order } from "@/app/types/order";
import { Flight } from "@/app/types/flight";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

type FooterProps = {
  order: Order;
  flight: Flight | null;
  onRefundSuccess?: () => void;
};

export default function Footer({ order, flight, onRefundSuccess }: FooterProps) {
  const router = useRouter();
  const [isRefunding, setIsRefunding] = useState(false);

  const status = order.status?.toLowerCase();

  const handleRefund = async () => {
    try {
      setIsRefunding(true);
      const response = await fetch(`${backendUrl}/api/orders/${order.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data &&
            typeof data === "object" &&
            "errors" in data &&
            Array.isArray(data.errors)
            ? data.errors[0]?.message
            : data?.message || "Failed to process refund. Please try again.";

        throw new Error(message);
      }

      toast.success(
        data?.message || "Your order cancel request is being processed"
      );

      if (onRefundSuccess) {
        onRefundSuccess();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "We could not process your refund request."
      );
    } finally {
      setIsRefunding(false);
    }
  };

  const handleReorder = () => {
    const flightId = flight?.id;
    if (flightId) {
      router.push(`/details/${flightId}`);
    } else {
      toast.error("Flight details are not available to reorder.");
    }
  };

  const handleContinuePayment = () => {
    router.push(`/order-review/${order.id}`);
  };

  if (status === "complete") {
    return (
      <footer className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Need to cancel your booking?
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              You can request a refund for your ticket if eligible.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefund}
            disabled={isRefunding}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefunding ? (
              <>
                <FaSpinner className="animate-spin text-base" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaUndoAlt className="text-sm" />
                <span>Refund</span>
              </>
            )}
          </button>
        </div>
      </footer>
    );
  }

  if (status === "canceled" || status === "cancelled") {
    return (
      <footer className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Want to rebook this flight?
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Select another seat and place a new reservation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReorder}
            disabled={!flight?.id}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaRedo className="text-sm" />
            <span>Reorder</span>
          </button>
        </div>
      </footer>
    );
  }

  if (status === "created") {
    return (
      <footer className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Complete your reservation
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Proceed to payment to finalize your ticket booking.
            </p>
          </div>

          <button
            type="button"
            onClick={handleContinuePayment}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-[0.99]"
          >
            <FaCreditCard className="text-sm" />
            <span>Continue payment</span>
          </button>
        </div>
      </footer>
    );
  }

  if (
    status === "awating-refund" ||
    status === "awaiting-refund" ||
    status === "awaiting_refund"
  ) {
    return (
      <footer className="rounded-2xl border border-purple-200 bg-purple-50/70 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <FaUndoAlt className="text-base" />
          </div>
          <div>
            <p className="text-base font-semibold text-purple-950">
              Your order is awaiting refund
            </p>
            <p className="mt-0.5 text-xs text-purple-700">
              Our team is processing your refund request. You will be notified once complete.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return null;
}
