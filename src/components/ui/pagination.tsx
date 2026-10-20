"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

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
  maxVisiblePages = 2,
  hideOnSinglePage = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  if (hideOnSinglePage && safeTotalPages <= 1) return null;

  const groupSize = Math.max(1, maxVisiblePages);
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, safeTotalPages);

  // Generate visible page numbers for the active pair/group
  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const isPrevDisabled = currentGroup === 0 && currentPage <= 1;
  const isNextDisabled = endPage >= safeTotalPages && currentPage >= safeTotalPages;

  const handlePrev = () => {
    if (currentGroup > 0) {
      const prevGroupStart = (currentGroup - 1) * groupSize + 1;
      onPageChange(prevGroupStart);
    } else if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleNext = () => {
    if (endPage < safeTotalPages) {
      const nextGroupStart = (currentGroup + 1) * groupSize + 1;
      onPageChange(nextGroupStart);
    } else if (currentPage < safeTotalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      aria-label="Navigasi Halaman"
      className={`flex items-center justify-center gap-2 py-4 select-none ${className}`}
    >
      {/* Tombol Sebelumnya (◀) */}
      <button
        type="button"
        disabled={isPrevDisabled}
        onClick={handlePrev}
        className="w-9 h-9 rounded-lg bg-white border border-primary-light flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface hover:border-silver disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95 cursor-pointer"
        aria-label="Halaman Sebelumnya"
      >
        <ChevronLeftIcon className="text-xs" />
      </button>

      {/* Nomor-nomor Halaman (Hanya 2 yang terlihat) */}
      {pages.map((page) => {
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
        disabled={isNextDisabled}
        onClick={handleNext}
        className="w-9 h-9 rounded-lg bg-white border border-primary-light flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface hover:border-silver disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95 cursor-pointer"
        aria-label="Halaman Selanjutnya"
      >
        <ChevronRightIcon className="text-xs" />
      </button>
    </nav>
  );
}
