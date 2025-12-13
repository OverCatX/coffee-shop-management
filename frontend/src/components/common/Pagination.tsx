"use client";

import React, { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage = 20,
    totalItems,
    showInfo = true,
  }) => {
    // Generate page numbers (show max 5 pages)
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page
        pages.push(1);

        if (currentPage > 3) {
          pages.push("...");
        }

        // Show pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (currentPage < totalPages - 2) {
          pages.push("...");
        }

        // Show last page
        pages.push(totalPages);
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();
    const startItem = totalItems
      ? (currentPage - 1) * itemsPerPage + 1
      : undefined;
    const endItem = totalItems
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        {showInfo && totalItems && (
          <div className="text-sm text-stone-600">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-stone-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
