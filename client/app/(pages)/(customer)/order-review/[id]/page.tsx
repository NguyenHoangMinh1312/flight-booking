"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import StripePayment from "./components/StripePayment";
import { Order } from "@/app/types/order";
import { Flight } from "@/app/types/flight";
import OrderHeaderBanner from "./components/OrderHeaderBanner";
import FlightDetailsCard from "./components/FlightDetailsCard";
import TicketDetailsCard from "./components/TicketDetailsCard";
import PaymentSummaryCard from "./components/PaymentSummaryCard";
import { apiFetch } from "@/app/utils/api-client";

export default function OrderReviewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // fetch the order details
  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const data = await apiFetch<Order>(
          `/api/orders/${id}`,
          {
            credentials: "include"
          }
        )
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not load the order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id])

  // fetch the associated flight details
  useEffect(() => {
    async function fetchFlightDetails() {
      if (!order)
        return

      try {
        const data = await apiFetch<Flight>(`/api/flights/tickets/${order.ticket.id}`)
        setFlight(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load the flight details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlightDetails()
  }, [order])

  // Reservation timer countdown loop
  useEffect(() => {
    if (!order?.expiresAt || order?.status === "complete")
      return;

    const updateTimer = () => {
      const expires = new Date(order.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order?.expiresAt, order?.status]);

  const isComplete = order?.status === "complete";
  const isExpired =
    !isComplete &&
    ((timeLeft !== null && timeLeft <= 0) || order?.status === "canceled");


  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 pb-24">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <FaExclamationTriangle className="mx-auto text-4xl text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-red-900">
              Order Not Found
            </h1>
            <p className="mt-2 text-red-700">
              {error || "We could not locate this order reservation."}
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FaArrowLeft />
                Back to Flights
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { ticket } = order;

  return (
    <div className="flex-1 bg-slate-50">
      {/* Top Banner / Navigation */}
      <OrderHeaderBanner
        order={order}
        isComplete={isComplete}
        isExpired={isExpired}
        timeLeft={timeLeft}
      />

      {/* Main Details Grid */}
      <div className="mx-auto max-w-7xl px-6 py-10 pb-28 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FlightDetailsCard flight={flight} ticket={ticket} />
            <TicketDetailsCard ticket={ticket} status={order.status} />
          </div>

          <div className="space-y-6">
            <PaymentSummaryCard
              ticket={ticket}
              isComplete={isComplete}
              isExpired={isExpired}
              onOpenPayment={() => setIsPaymentOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <StripePayment
        orderId={order.id}
        price={ticket.price}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => router.push(`/payment-success/${order.id}`)}
      />
    </div>
  );
}
