"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Flight } from "@/app/types/flight";
import FlightInfo from "@/app/(pages)/(customer)/details/[id]/components/FlightInfo";
import SeatsMatrix from "./components/SeatsMatrix";
import TicketInfo from "./components/TicketInfo";
import { Ticket } from "@/app/types/ticket";
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
  const [isCanceling, setIsCanceling] = useState(false);
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

  const handleCancelFlight = async () => {
    if (!id)
      return;

    setIsCanceling(true);

    try {
      await apiFetch(`/api/flights/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      toast.success("Flight canceled successfully!")
      router.push("/manager")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel flight")
    } finally {
      setIsCanceling(false)
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

        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          <FlightInfo flight={details.flight} />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Actions
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href={`/manager/update-flight/${id}`}
                className="w-full text-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition"
              >
                Update flight
              </Link>
              <button
                type="button"
                onClick={handleCancelFlight}
                disabled={isCanceling || details.flight.status === "canceled"}
                className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isCanceling ? "Canceling..." : "Cancel flight"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}