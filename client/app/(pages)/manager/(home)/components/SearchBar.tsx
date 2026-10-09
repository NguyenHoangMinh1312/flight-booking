"use client";

import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaDollarSign,
  FaHashtag,
  FaPlaneArrival,
  FaPlaneDeparture,
  FaSearch,
  FaTag,
  FaUndoAlt,
} from "react-icons/fa";

export type SearchFilters = {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  flightNumber: string;
  status: string;
  maxPrice: string;
};

type SearchBarProps = {
  onSearch: (filters: SearchFilters) => void;
  onReset?: () => void;
  isLoading?: boolean;
};

export default function SearchBar({
  onSearch,
  onReset,
  isLoading = false,
}: SearchBarProps) {
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [status, setStatus] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const hasActiveFilters = Boolean(
    departureAirport.trim() ||
      arrivalAirport.trim() ||
      departureDate ||
      flightNumber.trim() ||
      status.trim() ||
      maxPrice.trim()
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({
      departureAirport: departureAirport.trim(),
      arrivalAirport: arrivalAirport.trim(),
      departureDate,
      flightNumber: flightNumber.trim(),
      status: status.trim(),
      maxPrice: maxPrice.trim(),
    });
  };

  const handleReset = () => {
    setDepartureAirport("");
    setArrivalAirport("");
    setDepartureDate("");
    setFlightNumber("");
    setStatus("");
    setMaxPrice("");
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Departure Airport */}
          <div>
            <label
              htmlFor="managerDepartureAirport"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaPlaneDeparture className="text-sky-600" />
              Departure Airport
            </label>
            <input
              id="managerDepartureAirport"
              name="departureAirport"
              type="text"
              placeholder="e.g. Noi Bai"
              value={departureAirport}
              onChange={(e) => setDepartureAirport(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Arrival Airport */}
          <div>
            <label
              htmlFor="managerArrivalAirport"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaPlaneArrival className="text-sky-600" />
              Arrival Airport
            </label>
            <input
              id="managerArrivalAirport"
              name="arrivalAirport"
              type="text"
              placeholder="e.g. Tan Son Nhat"
              value={arrivalAirport}
              onChange={(e) => setArrivalAirport(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Departure Date (past dates allowed) */}
          <div>
            <label
              htmlFor="managerDepartureDate"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaCalendarAlt className="text-sky-600" />
              Departure Date
            </label>
            <input
              id="managerDepartureDate"
              name="departureDate"
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Flight Number */}
          <div>
            <label
              htmlFor="managerFlightNumber"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaHashtag className="text-sky-600" />
              Flight Number
            </label>
            <input
              id="managerFlightNumber"
              name="flightNumber"
              type="text"
              placeholder="e.g. VN123"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Flight Status */}
          <div>
            <label
              htmlFor="managerFlightStatus"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaTag className="text-sky-600" />
              Flight Status
            </label>
            <select
              id="managerFlightStatus"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Available (Default)</option>
              <option value="available">Available</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label
              htmlFor="managerMaxPrice"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaDollarSign className="text-sky-600" />
              Max Economy Price
            </label>
            <input
              id="managerMaxPrice"
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              title="Reset filters"
            >
              <FaUndoAlt className="text-xs" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSearch className="text-xs" />
            <span>{isLoading ? "Searching..." : "Search Flights"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
