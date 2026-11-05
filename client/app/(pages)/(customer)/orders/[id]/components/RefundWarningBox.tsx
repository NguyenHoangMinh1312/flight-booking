"use client";

import { FaExclamationTriangle } from "react-icons/fa";

type RefundWarningBoxProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function RefundWarningBox({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RefundWarningBoxProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 text-amber-600">
          <FaExclamationTriangle className="text-2xl shrink-0" />
          <h3 className="text-lg font-bold text-slate-900">Refund Warning</h3>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          A 5,000 VND penalty fee will be charged if you proceed with this refund request.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}
