"use client";

import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaEnvelope,
  FaSearch,
  FaTag,
  FaUndoAlt,
} from "react-icons/fa";
import { OrderStatus } from "@/app/types/order";

export type SearchFilters = {
  userEmail?: string;
  createdDate?: string;
  status?: string;
};

type SearchBarProps = {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  isLoading: boolean;
};

export default function SearchBar({
  onSearch,
  onReset,
  isLoading = false,
}: SearchBarProps) {
  const [userEmail, setUserEmail] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [status, setStatus] = useState("");

  const hasActiveFilters = Boolean(userEmail.trim() || createdDate || status.trim());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({
      userEmail: userEmail.trim(),
      createdDate,
      status: status.trim(),
    });
  };

  const handleReset = () => {
    setCreatedDate("");
    setStatus("");
    setUserEmail("");

    onReset();
  };

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* User Email */}
          <div>
            <label
              htmlFor="userEmail"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaEnvelope className="text-sky-600" />
              User Email
            </label>
            <input
              id="userEmail"
              name="userEmail"
              type="text"
              placeholder="e.g. user@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Created Date */}
          <div>
            <label
              htmlFor="createdDate"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaCalendarAlt className="text-sky-600" />
              Order Date
            </label>
            <input
              id="createdDate"
              name="createdDate"
              type="date"
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Order Status */}
          <div>
            <label
              htmlFor="orderStatus"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              <FaTag className="text-sky-600" />
              Order Status
            </label>
            <select
              id="orderStatus"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
            >
              <option value="">All Statuses</option>
              <option value={OrderStatus.Complete}>Complete</option>
              <option value={OrderStatus.Created}>Created</option>
              <option value={OrderStatus.AwaitingRefund}>Awaiting Refund</option>
              <option value={OrderStatus.Canceled}>Canceled</option>
              <option value={OrderStatus.RefundFailed}>Refund Failed</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
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
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSearch className="text-xs" />
            <span>{isLoading ? "Searching..." : "Search Orders"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
