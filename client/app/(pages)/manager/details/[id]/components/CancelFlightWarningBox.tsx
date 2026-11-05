"use client";

import { FaExclamationTriangle } from "react-icons/fa";

type CancelFlightWarningBoxProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function CancelFlightWarningBox({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CancelFlightWarningBoxProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 text-rose-600">
          <FaExclamationTriangle className="text-2xl shrink-0" />
          <h3 className="text-lg font-bold text-slate-900">Cancel Flight</h3>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Are you sure you want to cancel this flight? This action cannot be undone and will cancel all associated tickets.
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
            {isLoading ? "Canceling..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}
