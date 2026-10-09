"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createFlightSchema } from "./validation/create-flight-schema";
import FlightInfoCard from "./components/FlightInfoCard";
import RouteAndScheduleCard from "./components/RouteAndScheduleCard";
import SeatConfigCard from "./components/SeatConfigCard";
import TicketPriceCard from "./components/TicketPriceCard";
import { apiFetch } from "@/app/utils/api-client";

export default function CreateFlightPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting)
      return;

    const formData = new FormData(e.currentTarget);
    const result = createFlightSchema.safeParse({
      flightNumber: formData.get("flightNumber"),
      description: formData.get("description"),
      departureAirport: formData.get("departureAirport"),
      departureDate: formData.get("departureDate"),
      arrivalAirport: formData.get("arrivalAirport"),
      arrivalDate: formData.get("arrivalDate"),
      rows: formData.get("rows"),
      columns: formData.get("columns"),
      firstFromRow: formData.get("firstFromRow"),
      firstToRow: formData.get("firstToRow"),
      businessFromRow: formData.get("businessFromRow"),
      businessToRow: formData.get("businessToRow"),
      economyFromRow: formData.get("economyFromRow"),
      economyToRow: formData.get("economyToRow"),
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
      await apiFetch(`/api/flights`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          flightNumber: result.data.flightNumber,
          description: result.data.description,
          departure: {
            airport: result.data.departureAirport,
            date: new Date(result.data.departureDate).toISOString(),
          },
          arrival: {
            airport: result.data.arrivalAirport,
            date: new Date(result.data.arrivalDate).toISOString(),
          },
          seatConfig: {
            rows: result.data.rows,
            columns: result.data.columns,
            classes: [
              {
                class: "first",
                fromRow: result.data.firstFromRow,
                toRow: result.data.firstToRow,
              },
              {
                class: "business",
                fromRow: result.data.businessFromRow,
                toRow: result.data.businessToRow,
              },
              {
                class: "economy",
                fromRow: result.data.economyFromRow,
                toRow: result.data.economyToRow,
              },
            ],
          },
          priceConfig: {
            first: result.data.priceFirst,
            business: result.data.priceBusiness,
            economy: result.data.priceEconomy,
          },
        })
      })

      toast.success("Flight created successfully!");
      router.push("/manager");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create flight")
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Create a New Flight
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the flight details, route, schedule, seat configuration, and ticket prices below.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FlightInfoCard />

            <RouteAndScheduleCard />

            <SeatConfigCard />

            <TicketPriceCard />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-sky-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating flight..." : "Create flight"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
