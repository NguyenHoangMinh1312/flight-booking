"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Flight } from "@/app/types/flight";
import { updateFlightSchema } from "./validation/update-flight-schema";
import FlightInfoCard from "../../create-flight/components/FlightInfoCard";
import RouteAndScheduleCard from "../../create-flight/components/RouteAndScheduleCard";
import SeatConfigCard from "../../create-flight/components/SeatConfigCard";
import TicketPriceCard from "../../create-flight/components/TicketPriceCard";
import { apiFetch } from "@/app/utils/api-client";
import { Ticket } from "@/app/types/ticket";

function formatToDateTimeLocal(dateString?: string): string {
  if (!dateString)
    return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime()))
    return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = pad(date.getFullYear());
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

type FlightDetailsResponse = {
  flight: Flight;
  tickets: Ticket[];
};

export default function UpdateFlightPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFlight() {
      if (!id)
        return;

      try {
        const data = await apiFetch<FlightDetailsResponse>(`/api/flights/${id}`)
        setFlight(data.flight)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load flight details");
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlight()
  }, [id]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting)
      return

    const formData = new FormData(e.currentTarget)

    const result = updateFlightSchema.safeParse({
      description: formData.get("description"),
      priceFirst: formData.get("priceFirst"),
      priceBusiness: formData.get("priceBusiness"),
      priceEconomy: formData.get("priceEconomy"),
    });

    if (!result.success) {
      const err = result.error.issues[0]?.message;
      toast.error(err || "Please check your input");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch(`/api/flights/${id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({
          description: result.data.description,
          priceConfig: {
            first: result.data.priceFirst,
            business: result.data.priceBusiness,
            economy: result.data.priceEconomy,
          },
        }),
      })

      toast.success("Flight updated successfully!");
      router.push("/manager");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update flight");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="h-8 w-36 animate-pulse rounded bg-slate-200 mb-6" />
          <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error || !flight) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-6">
          </div>
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
            role="alert"
          >
            {error || "Flight not found"}
          </div>
        </div>
      </main>
    );
  }

  const firstClass = flight.seatConfig?.classes?.find((c) => c.class === "first");
  const businessClass = flight.seatConfig?.classes?.find((c) => c.class === "business");
  const economyClass = flight.seatConfig?.classes?.find((c) => c.class === "economy");

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Update Flight
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update the flight description and ticket prices below. Route and seat configurations are locked.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <form key={flight.id} onSubmit={handleSubmit} className="space-y-6">
            <FlightInfoCard
              flightNumber={flight.flightNumber}
              description={flight.description}
            />

            <RouteAndScheduleCard
              departureAirport={flight.departure?.airport}
              departureDate={formatToDateTimeLocal(flight.departure?.date)}
              arrivalAirport={flight.arrival?.airport}
              arrivalDate={formatToDateTimeLocal(flight.arrival?.date)}
            />

            <SeatConfigCard
              rows={flight.seatConfig?.rows}
              columns={flight.seatConfig?.columns}
              firstFromRow={firstClass?.fromRow}
              firstToRow={firstClass?.toRow}
              businessFromRow={businessClass?.fromRow}
              businessToRow={businessClass?.toRow}
              economyFromRow={economyClass?.fromRow}
              economyToRow={economyClass?.toRow}
            />

            <TicketPriceCard
              priceFirst={flight.priceConfig?.first}
              priceBusiness={flight.priceConfig?.business}
              priceEconomy={flight.priceConfig?.economy}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-sky-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Updating flight..." : "Update flight"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
