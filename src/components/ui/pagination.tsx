"use client";

import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
  hideOnSinglePage?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  maxVisiblePages = 5,
  hideOnSinglePage = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  if (hideOnSinglePage && safeTotalPages <= 1) return null;

  // Calculate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (safeTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = start + maxVisiblePages - 1;

      if (end > safeTotalPages) {
        end = safeTotalPages;
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (end < safeTotalPages) {
        if (end < safeTotalPages - 1) pages.push("...");
        pages.push(safeTotalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Navigasi Halaman"
      className={`flex items-center justify-center gap-2 py-4 select-none ${className}`}
    >
      {/* Tombol Sebelumnya (◀) */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="w-9 h-9 rounded-lg bg-white border border-primary-light flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface hover:border-silver disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95 cursor-pointer"
        aria-label="Halaman Sebelumnya"
      >
        <svg
          className="w-3 h-3 fill-current text-gray-500"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M16 19L7 12l9-7v14z" />
        </svg>
      </button>

      {/* Nomor-nomor Halaman */}
      {pages.map((page, idx) => {
        if (typeof page === "string") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-xs font-semibold text-text-secondary"
            >
              &hellip;
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={isActive ? "page" : undefined}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
              isActive
                ? "bg-primary text-white border border-primary shadow-xs"
                : "bg-white text-text-secondary border border-primary-light hover:text-primary hover:bg-surface hover:border-silver"
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Tombol Selanjutnya (▶) */}
      <button
        type="button"
        disabled={currentPage >= safeTotalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, safeTotalPages))}
        className="w-9 h-9 rounded-lg bg-white border border-primary-light flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface hover:border-silver disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95 cursor-pointer"
        aria-label="Halaman Selanjutnya"
      >
        <svg
          className="w-3 h-3 fill-current text-gray-500"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 5l9 7-9 7V5z" />
        </svg>
      </button>
    </nav>
  );
}
