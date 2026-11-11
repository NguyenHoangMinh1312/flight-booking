"use client";

import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaDollarSign,
  FaHashtag,
  FaPlaneArrival,
  FaPlaneDeparture,
  FaSearch,
  FaUndoAlt,
} from "react-icons/fa";
import { Airport } from "@/app/types/airport";

export type SearchFilters = {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  flightNumber: string;
  maxPrice: string;
};

type SearchBarProps = {
  airports: Airport[];
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  isLoading: boolean;
};

export default function SearchBar({
  airports = [],
  onSearch,
  onReset,
  isLoading = false,
}: SearchBarProps) {
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Get today's date string in YYYY-MM-DD format to prevent selecting past dates
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // check if there is any filter (for reset button)
  const hasActiveFilters = Boolean(
    departureAirport.trim() ||
    arrivalAirport.trim() ||
    departureDate ||
    flightNumber.trim() ||
    maxPrice.trim()
  );

  // handle when user presses search button
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (departureDate && departureDate < todayString) {
      return;
    }
    onSearch({
      departureAirport: departureAirport.trim(),
      arrivalAirport: arrivalAirport.trim(),
      departureDate,
      flightNumber: flightNumber.trim(),
      maxPrice: maxPrice.trim(),
    });
  };

  // handle when user presses reset button
  const handleReset = () => {
    setDepartureAirport("");
    setArrivalAirport("");
    setDepartureDate("");
    setFlightNumber("");
    setMaxPrice("");

    onReset();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Departure Airport */}
          <div>
            <label
              htmlFor="departureAirport"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaPlaneDeparture className="text-sky-600" />
              Departure Airport
            </label>
            <select
              id="departureAirport"
              name="departureAirport"
              value={departureAirport}
              onChange={(e) => setDepartureAirport(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select departure airport</option>
              {airports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {`${airport.code} (${airport.name}, ${airport.city}, ${airport.country})`}
                </option>
              ))}
            </select>
          </div>

          {/* Arrival Airport */}
          <div>
            <label
              htmlFor="arrivalAirport"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaPlaneArrival className="text-sky-600" />
              Arrival Airport
            </label>
            <select
              id="arrivalAirport"
              name="arrivalAirport"
              value={arrivalAirport}
              onChange={(e) => setArrivalAirport(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select arrival airport</option>
              {airports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {`${airport.code} (${airport.name}, ${airport.city}, ${airport.country})`}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Date */}
          <div>
            <label
              htmlFor="departureDate"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaCalendarAlt className="text-sky-600" />
              Departure Date
            </label>
            <input
              id="departureDate"
              name="departureDate"
              type="date"
              min={todayString}
              value={departureDate}
              onChange={(e) => {
                const val = e.target.value;
                if (!val || val >= todayString) {
                  setDepartureDate(val);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Flight Number */}
          <div>
            <label
              htmlFor="flightNumber"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaHashtag className="text-sky-600" />
              Flight Number
            </label>
            <input
              id="flightNumber"
              name="flightNumber"
              type="text"
              placeholder="e.g. VN123"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Max Price */}
          <div>
            <label
              htmlFor="maxPrice"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaDollarSign className="text-sky-600" />
              Max Economy Price
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              step="10000"
              placeholder="e.g. 1000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSearch className="text-xs" />
              <span>{isLoading ? "Searching..." : "Search Flights"}</span>
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                title="Reset filters"
              >
                <FaUndoAlt className="text-xs" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
