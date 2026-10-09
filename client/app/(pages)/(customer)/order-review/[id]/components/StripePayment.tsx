"use client";

import { useState, useEffect, useMemo } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { FaLock, FaTimes, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { FaCcStripe } from "react-icons/fa6";
import CheckoutForm from "./CheckoutForm";
import { apiFetch } from "@/app/utils/api-client";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

interface StripePaymentProps {
  orderId: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export type PaymentIntentResponse = {
  clientSecret: string | null,
  paymentIntentId: string
}

export default function StripePayment({
  orderId,
  price,
  isOpen,
  onClose,
  onSuccess,
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const isLoadingIntent = !clientSecret && !intentError;

  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, []);

  useEffect(() => {
    async function fetchPaymentIntent() {
      if (!isOpen || !orderId)
        return;

      if (!publishableKey) {
        setIntentError("Payment service is temporarily unavailable.");
        return;
      }

      let isMounted = true;

      try {
        const data = await apiFetch<PaymentIntentResponse>(
          `/api/payments/create-intent`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ orderId })
          }
        )

        if (isMounted)
          setClientSecret(data.clientSecret)
      } catch (err) {
        if (isMounted)
          setIntentError(err instanceof Error ? err.message : "Failed to create payment intent.")
      } finally {
        isMounted = false
      }
    }

    fetchPaymentIntent()
  }, [isOpen, orderId]);

  if (!isOpen)
    return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[calc(100vh-2rem)] sm:max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FaCcStripe className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Secure Payment</h2>
              <p className="text-xs text-slate-500">
                Encrypted Stripe Checkout • Order #{orderId.slice(-8)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close payment dialog"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {isLoadingIntent && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 space-y-3">
              <FaSpinner className="animate-spin text-3xl text-indigo-600" />
              <p className="text-sm font-medium">Preparing secure checkout...</p>
            </div>
          )}

          {intentError && !isLoadingIntent && (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FaExclamationCircle className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Checkout Error</h3>
                <p className="mt-1 text-sm text-slate-600">{intentError}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          )}

          {clientSecret && !isLoadingIntent && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#4f46e5",
                    colorBackground: "#ffffff",
                    colorText: "#0f172a",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <CheckoutForm
                orderId={orderId}
                price={price}
                onSuccess={onSuccess}
                onCancel={onClose}
              />
            </Elements>
          )}
        </div>

        {/* Modal Footer Security Badge */}
        <div className="mt-4 shrink-0 flex items-center justify-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-400">
          <FaLock className="text-emerald-500" />
          <span>256-bit SSL encryption. Powered by Stripe.</span>
        </div>
      </div>
    </div>
  );
}
