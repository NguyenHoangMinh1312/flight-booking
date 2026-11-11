"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createFlightSchema } from "./validation/create-flight-schema";
import FlightInfoCard from "./components/FlightInfoCard";
import RouteAndScheduleCard from "./components/RouteAndScheduleCard";
import SeatConfigCard from "./components/SeatConfigCard";
import TicketPriceCard from "./components/TicketPriceCard";
import { apiFetch } from "@/app/utils/api-client";
import { Airport } from "@/app/types/airport";

export default function CreateFlightPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enabledClasses, setEnabledClasses] = useState({
    first: false,
    business: false,
    economy: true,
  });

  const handleToggleClass = (
    seatClass: "first" | "business" | "economy",
    enabled: boolean
  ) => {
    setEnabledClasses((prev) => ({ ...prev, [seatClass]: enabled }));
  };

  // get the list of supported airports
  useEffect(() => {
    const fetchAirports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFetch<Airport[]>("/api/flights/airports");
        setAirports(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We could not load the available airports"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAirports();
  }, []);

  // send a request to backend to create a flight
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const result = createFlightSchema.safeParse({
      flightNumber: formData.get("flightNumber"),
      description: formData.get("description"),
      departureAirport: formData.get("departureAirport"),
      departureDate: formData.get("departureDate"),
      arrivalAirport: formData.get("arrivalAirport"),
      arrivalDate: formData.get("arrivalDate"),
      rows: formData.get("rows"),
      firstFromRow: formData.get("firstFromRow"),
      firstToRow: formData.get("firstToRow"),
      firstColumns: formData.get("firstColumns"),
      firstPrice: formData.get("firstPrice"),
      businessFromRow: formData.get("businessFromRow"),
      businessToRow: formData.get("businessToRow"),
      businessColumns: formData.get("businessColumns"),
      businessPrice: formData.get("businessPrice"),
      economyFromRow: formData.get("economyFromRow"),
      economyToRow: formData.get("economyToRow"),
      economyColumns: formData.get("economyColumns"),
      economyPrice: formData.get("economyPrice"),
    });

    if (!result.success) {
      const err = result.error.issues[0]?.message;
      toast.error(err || "Please check your input");
      return;
    }

    // Build classConfig array containing only configured classes
    const classConfig = [];

    if (
      result.data.firstFromRow &&
      result.data.firstToRow &&
      result.data.firstColumns &&
      result.data.firstPrice
    ) {
      classConfig.push({
        class: "first",
        fromRow: result.data.firstFromRow,
        toRow: result.data.firstToRow,
        columns: result.data.firstColumns,
        price: result.data.firstPrice,
      });
    }

    if (
      result.data.businessFromRow &&
      result.data.businessToRow &&
      result.data.businessColumns &&
      result.data.businessPrice
    ) {
      classConfig.push({
        class: "business",
        fromRow: result.data.businessFromRow,
        toRow: result.data.businessToRow,
        columns: result.data.businessColumns,
        price: result.data.businessPrice,
      });
    }

    if (
      result.data.economyFromRow &&
      result.data.economyToRow &&
      result.data.economyColumns &&
      result.data.economyPrice
    ) {
      classConfig.push({
        class: "economy",
        fromRow: result.data.economyFromRow,
        toRow: result.data.economyToRow,
        columns: result.data.economyColumns,
        price: result.data.economyPrice,
      });
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
          rows: result.data.rows,
          classConfig,
        }),
      });

      toast.success("Flight created successfully!");
      router.push("/manager");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create flight"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Create a New Flight
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the flight details, route, schedule, seat configuration, and
            ticket prices below.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FlightInfoCard />

            {!isLoading && !error && (
              <RouteAndScheduleCard airports={airports} />
            )}

            <SeatConfigCard
              enabledClasses={enabledClasses}
              onToggleClass={handleToggleClass}
            />

            <TicketPriceCard enabledClasses={enabledClasses} />

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
