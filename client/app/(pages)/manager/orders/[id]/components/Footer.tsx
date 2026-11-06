"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaUndoAlt, FaSpinner } from "react-icons/fa";
import { Order } from "@/app/types/order";
import RefundWarningBox from "./RefundWarningBox";
import { apiFetch } from "@/app/utils/api-client";
import { RefundReason } from "@/app/types/order";

type FooterProps = {
  order: Order;
  onRefundSuccess?: () => void;
};


export default function Footer({ order, onRefundSuccess }: FooterProps) {
  const [isRefunding, setIsRefunding] = useState(false);
  const [isWarningBoxOpen, setIsWarningBoxOpen] = useState(false);

  const status = order.status?.toLowerCase();

  const handleRefund = async (refundReason: RefundReason) => {
    try {
      setIsRefunding(true);

      const data = await apiFetch<{ message: string }>(
        `/api/orders/${order.id}`,
        {
          method: "DELETE",
          credentials: "include",
          body: JSON.stringify({ refundReason })
        }
      )

      toast.success(data.message || "Your order cancel request is being processed");

      setIsWarningBoxOpen(false);

      if (onRefundSuccess) {
        onRefundSuccess();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "We could not process your refund request."
      );
    } finally {
      setIsRefunding(false);
    }
  };

  if (status === "complete" || status === "refund-failed") {
    return (
      <>
        <footer className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Need to cancel this booking?
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                You can request a refund for this ticket.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWarningBoxOpen(true)}
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

        <RefundWarningBox
          isOpen={isWarningBoxOpen}
          onClose={() => setIsWarningBoxOpen(false)}
          onConfirm={handleRefund}
          isLoading={isRefunding}
        />
      </>
    );
  }

  return null;
}
