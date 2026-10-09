"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaExclamationCircle } from "react-icons/fa";
import FlightInfo from "./components/FlightInfo";
import TicketInfo from "./components/TicketInfo";
import OrderInfo from "./components/OrderInfo";
import Footer from "./components/Footer";
import { Order } from "@/app/types/order";
import { Flight } from "@/app/types/flight";
import { apiFetch } from "@/app/utils/api-client";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch the order detail
  useEffect(() => {
    async function fetchOrder() {
      if (!id)
        return

      try {
        const data = await apiFetch<Order>(
          `/api/orders/${id}`,
          {
            credentials: "include"
          }
        )
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load this order details")
      }
    }

    fetchOrder()
  }, [id])

  // fetch the associated flight details
  useEffect(() => {
    async function fetchFlight() {
      if (!order?.ticket?.id)
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

    fetchFlight()
  }, [order]);

  const handleRefundSuccess = () => {
    // Update local order status immediately to awaiting refund
    if (order) {
      setOrder({
        ...order,
        status: "awaiting-refund",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Orders</span>
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Order Details
            </h1>
            {order?.id && (
              <span className="rounded-full bg-slate-200/80 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                #{order.id.slice(-8)}
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col gap-6" aria-label="Loading order details">
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && (error) && (
          <div
            className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
            role="alert"
          >
            <FaExclamationCircle className="mt-0.5 shrink-0 text-xl text-red-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                Unable to load order details
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error || "Order could not be found."}
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/orders"
                  className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Return to Orders
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Vertical Stacked Layout */}
        {!isLoading && order && (
          <div className="flex flex-col gap-6">
            {/* 1. Flight Information */}
            <FlightInfo
              flight={flight}
              fallbackDepartureDate={order.ticket?.departureDate}
            />

            {/* 2. Ticket Information */}
            <TicketInfo ticket={order.ticket} />

            {/* 3. Order Information */}
            <OrderInfo order={order} />

            {/* 4. Footer */}
            <Footer
              order={order}
              flight={flight}
              onRefundSuccess={handleRefundSuccess}
            />
          </div>
        )}
      </div>
    </main>
  );
}
