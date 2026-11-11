"use client";

import { useEffect, useState } from "react";
import FlightCard from "./components/FlightCard";
import SearchBar, { SearchFilters } from "./components/SearchBar";
import Pagination from "./components/Pagination";
import { Flight } from "@/app/types/flight";
import { apiFetch } from "@/app/utils/api-client";
import { Airport } from "@/app/types/airport";

const DEFAULT_PAGE_SIZE = 10;

export default function HomePage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | undefined>(undefined);

  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // fetch flights with pagination and optional search filters
  const fetchFlights = async (
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    filters?: SearchFilters
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

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
      if (filters?.status?.trim()) {
        params.append("status", filters.status.trim());
      }
      if (filters?.maxPrice?.trim() && !isNaN(Number(filters.maxPrice))) {
        params.append("maxPrice", filters.maxPrice.trim());
      }

      const queryString = params.toString();
      const endpoint = `/api/flights?${queryString}`;

      const data = await apiFetch<{ flights: Flight[]; total: number }>(endpoint);
      setFlights(data.flights ?? []);
      setTotal(data.total ?? 0);
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

  // get the list of supported airports
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const data = await apiFetch<Airport[]>("/api/flights/airports");
        setAirports(data);
      } catch (err) {
        console.error("Failed to load airports:", err);
      }
    };

    fetchAirports();
  }, []);

  // initial load of flights
  useEffect(() => {
    fetchFlights(1, DEFAULT_PAGE_SIZE);
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    const hasFilterValues = Boolean(
      filters.departureAirport?.trim() ||
      filters.arrivalAirport?.trim() ||
      filters.departureDate ||
      filters.flightNumber?.trim() ||
      filters.status?.trim() ||
      filters.maxPrice?.trim()
    );
    setHasSearched(hasFilterValues);
    setCurrentFilters(filters);
    setCurrentPage(1);
    fetchFlights(1, pageSize, filters);
  };

  const handleReset = () => {
    setHasSearched(false);
    setCurrentFilters(undefined);
    setCurrentPage(1);
    fetchFlights(1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchFlights(newPage, pageSize, currentFilters);

    const resultsElement = document.getElementById("flight-results");
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchFlights(1, newPageSize, currentFilters);
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

        {/* Manager Search Bar */}
        <div className="mt-8">
          <SearchBar
            airports={airports}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </div>

        {/* Flight Results */}
        <div className="mt-12" id="flight-results">
          {!isLoading && !error && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {hasSearched ? "Search Results" : "Available Flights"}
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {total} {total === 1 ? "flight" : "flights"} found
              </span>
            </div>
          )}

          {isLoading && (
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading flights"
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
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

          {!isLoading && !error && total === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              {hasSearched
                ? "No flights found matching your search criteria. Try adjusting your filters."
                : "There are no available flights right now. Please check back soon."}
            </div>
          )}

          {!isLoading && !error && total > 0 && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {flights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={isLoading}
                itemLabel="flights"
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
