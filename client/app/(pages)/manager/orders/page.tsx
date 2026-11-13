"use client";

import { useEffect, useState } from "react";
import { FaExclamationCircle, FaTicketAlt, FaUndoAlt } from "react-icons/fa";
import OrderCard from "./components/OrderCard";
import SearchBar, { SearchFilters } from "./components/SearchBar";
import Pagination from "./components/Pagination";
import { Order } from "@/app/types/order";
import { apiFetch } from "@/app/utils/api-client";

const DEFAULT_PAGE_SIZE = 10;

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // fetch orders with pagination and optional search filters
  const fetchOrders = async (
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

      if (filters?.userId?.trim()) {
        params.append("userId", filters.userId.trim());
      }
      if (filters?.createdDate) {
        params.append("createdDate", filters.createdDate);
      }
      if (filters?.status?.trim()) {
        params.append("status", filters.status.trim());
      }

      const queryString = params.toString();
      const endpoint = `/api/orders/all?${queryString}`;

      const data = await apiFetch<{ orders: Order[]; total: number }>(endpoint, {
        credentials: "include",
      });

      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // initial load of orders
  useEffect(() => {
    const loadInitialOrders = async () => {
      await fetchOrders(1, DEFAULT_PAGE_SIZE);
    };

    loadInitialOrders();
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    const hasFilterValues = Boolean(
      filters.userId?.trim() || filters.createdDate || filters.status?.trim()
    );
    setHasSearched(hasFilterValues);
    setCurrentFilters(filters);
    setCurrentPage(1);
    fetchOrders(1, pageSize, filters);
  };

  const handleReset = () => {
    setHasSearched(false);
    setCurrentFilters(undefined);
    setCurrentPage(1);
    fetchOrders(1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders(newPage, pageSize, currentFilters);

    const resultsElement = document.getElementById("orders-results");
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchOrders(1, newPageSize, currentFilters);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Customer Orders
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Search, view, and manage customer flight orders and reservations.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onReset={handleReset}
          isLoading={isLoading}
        />

        {/* Content Section */}
        <div id="orders-results">
          {/* Header count when not loading */}
          {!isLoading && !error && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {hasSearched ? "Search Results" : "All Orders"}
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {total} {total === 1 ? "order" : "orders"} found
              </span>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex flex-col gap-4" aria-label="Loading orders">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div
              className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
              role="alert"
            >
              <FaExclamationCircle className="mt-0.5 shrink-0 text-xl text-red-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Unable to load orders</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && total === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FaTicketAlt className="text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {hasSearched ? "No matching orders found" : "No orders found"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                {hasSearched
                  ? "No orders match your search criteria. Try adjusting your user ID, date, or status filters."
                  : "There are no customer orders recorded in the system yet."}
              </p>
              {hasSearched && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                  >
                    <FaUndoAlt className="text-xs" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders List: Stacked vertically */}
          {!isLoading && !error && total > 0 && (
            <>
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
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
                itemLabel="orders"
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
