import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaLock, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { currencyFormatter } from "@/app/utils/format-currency";

type Props = {
  orderId: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function CheckoutForm({
  orderId,
  price,
  onSuccess,
  onCancel,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements)
      return;

    if (isProcessing)
      return

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success/${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(
          error.message ?? "An error occurred during payment processing."
        );
        setIsProcessing(false);
        return;
      }

      if (paymentIntent &&
        (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        toast.success("Payment completed successfully!");
        onSuccess();
      } else {
        toast.error("Payment status could not be verified. Please try again.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-1/3 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="animate-spin text-base" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <FaLock className="text-xs" />
              <span>Pay {currencyFormatter.format(price)}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
