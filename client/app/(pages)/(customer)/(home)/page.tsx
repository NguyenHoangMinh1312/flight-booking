"use client";

import { useEffect, useState } from "react";
import FlightCard from "./components/FlightCard";
import SearchBar, { SearchFilters } from "./components/SearchBar";
import { Flight } from "@/app/types/flight";
import { apiFetch } from "@/app/utils/api-client";

export default function HomePage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchFlights = async (filters?: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters?.departureAirport?.trim()) {
        params.append("departureAirport", filters.departureAirport.trim());
      }
      if (filters?.arrivalAirport?.trim()) {
        params.append("arrivalAirport", filters.arrivalAirport.trim());
      }
      if (filters?.departureDate) {
        params.append("departureDate", filters.departureDate);
      }
      if (filters?.flightNumber?.trim()) {
        params.append("flightNumber", filters.flightNumber.trim());
      }
      if (filters?.maxPrice?.trim() && !isNaN(Number(filters.maxPrice))) {
        params.append("maxPrice", filters.maxPrice.trim());
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/flights?${queryString}` : "/api/flights";

      const data = await apiFetch<Flight[]>(endpoint);
      setFlights(data);
      setHasSearched(Boolean(queryString));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not load the available flights."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function fetchInitialFlights() {
      try {
        const data = await apiFetch<Flight[]>("/api/flights");
        if (!ignore) {
          setFlights(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not load the available flights."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialFlights();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    searchFlights(filters);
  };

  const handleReset = () => {
    setHasSearched(false);
    searchFlights();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
            Fly with confidence
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find your next journey
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Explore our available flights and choose the route that takes you where you want to go.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8">
          <SearchBar
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </div>

        {/* Flight Results */}
        <div className="mt-12">
          {!isLoading && !error && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {hasSearched ? "Search Results" : "Available Flights"}
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {flights.length} {flights.length === 1 ? "flight" : "flights"} found
              </span>
            </div>
          )}

          {isLoading && (
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading flights"
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {!isLoading && !error && flights.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              {hasSearched
                ? "No flights found matching your search criteria. Try adjusting your filters."
                : "There are no available flights right now. Please check back soon."}
            </div>
          )}

          {!isLoading && !error && flights.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
