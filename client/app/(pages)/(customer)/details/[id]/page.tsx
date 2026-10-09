"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Flight } from "@/app/types/flight";
import FlightInfo from "./components/FlightInfo";
import OrderFooter from "./components/OrderFooter";
import SeatsMatrix from "./components/SeatsMatrix";
import { Ticket } from "@/app/types/ticket";
import TicketInfo from "./components/TicketInfo";
import { apiFetch } from "@/app/utils/api-client";

type FlightDetailsResponse = {
  flight: Flight;
  tickets: Ticket[];
};

export default function FlightDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [details, setDetails] = useState<FlightDetailsResponse | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load the flight details
  useEffect(() => {
    async function fetchFlightDetails() {
      try {
        const data = await apiFetch<FlightDetailsResponse>(`/api/flights/${id}`)
        setDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not load this flight.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlightDetails()
  }, [id])

  // handle when user clicks "Order"
  const orderTicket = async () => {
    if (!selectedTicket || selectedTicket.orderId || isOrdering)
      return

    setIsOrdering(true)

    try {
      const data = await apiFetch<{ id: string }>(
        "/api/orders",
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            ticketId: selectedTicket.id,
          })
        }
      )

      setSelectedTicket(null)
      router.push(`/order-review/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We cannot reserve the seat")
    } finally {
      setIsOrdering(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div
          className="h-[32rem] animate-pulse rounded-2xl bg-slate-200"
          aria-label="Loading flight details"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <div className="flex-1 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 pb-28 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <div className="space-y-6">
          <SeatsMatrix
            rows={details.flight.seatConfig?.rows ?? 0}
            columns={details.flight.seatConfig?.columns ?? 0}
            tickets={details.tickets}
            selectedTicketId={selectedTicket?.id ?? null}
            onSelect={setSelectedTicket}
          />

          <TicketInfo ticket={selectedTicket} />
        </div>

        <FlightInfo flight={details.flight} />
      </div>

      <OrderFooter
        ticket={selectedTicket}
        isOrdering={isOrdering}
        onOrder={orderTicket}
      />
    </div>
  );
}