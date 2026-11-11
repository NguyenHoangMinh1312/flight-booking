"use client";

import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export type PaginationProps = {
  currentPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
};

export default function Pagination({
  currentPage,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  itemLabel = "flights",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isLoading) {
      return;
    }
    onPageChange(page);
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <p>
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
          <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
          <span className="font-semibold text-slate-900">{total}</span> {itemLabel}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-xs text-slate-500">
            Per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination Navigation" className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft className="h-3 w-3" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page)}
                disabled={isLoading}
                aria-current={currentPage === page ? "page" : undefined}
                className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-sky-600 text-white shadow-sm"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {page}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-sm text-slate-400 select-none"
              >
                {page}
              </span>
            )
          )}

          <button
            type="button"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Next page"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <FaChevronRight className="h-3 w-3" />
          </button>
        </nav>
      )}
    </div>
  );
}
