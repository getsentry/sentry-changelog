"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { serializeFeedQuery } from "@/lib/changelog-feed";

export function Pagination({
  totalPages,
  currentPage,
  onPageNumberChange,
  selectedMonth,
  search,
  selectedCategoriesIds,
}: {
  totalPages: number;
  currentPage: number;
  selectedCategoriesIds: string[];
  selectedMonth: string | null;
  search: string | null;
  onPageNumberChange?: (pageNumber: number) => void;
}) {
  const pages: number[] = [];
  for (let page = 1; page <= totalPages; page++) {
    if (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 2
    ) {
      pages.push(page);
    } else if (pages.at(-1) !== 0) {
      pages.push(0);
    }
  }

  const href = (page: number) =>
    `/changelog/${serializeFeedQuery({
      month: selectedMonth,
      categories: selectedCategoriesIds,
      search,
      page,
    })}`;
  const navigate = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
    // Preserve normal open-in-new-tab and modifier-click behavior.
    if (
      !onPageNumberChange ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    onPageNumberChange(page);
  };
  const edgeClass =
    "hidden md:flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-white uppercase rounded-lg hover:bg-white/10 active:bg-white/20";
  return (
    <nav
      aria-label="Changelog pages"
      className="flex items-center justify-center gap-0 md:gap-4"
    >
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          onClick={(event) => navigate(event, currentPage - 1)}
          className={edgeClass}
        >
          ← Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${edgeClass} opacity-50`}>
          ← Previous
        </span>
      )}
      <div className="flex items-center gap-0 md:gap-2">
        {pages.map((page, index) =>
          page === 0 ? (
            <span
              key={`ellipsis-${pages[index - 1]}`}
              aria-hidden="true"
              className="w-10 text-center text-white/60"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={href(page)}
              onClick={(event) => navigate(event, page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex h-10 w-10 items-center justify-center select-none rounded-lg text-center font-sans text-xs font-medium text-white hover:bg-white/10 active:bg-white/20 ${page === currentPage ? "bg-white/20 shadow-md hover:bg-white/25" : ""}`}
            >
              {page}
            </Link>
          ),
        )}
      </div>
      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          onClick={(event) => navigate(event, currentPage + 1)}
          className={edgeClass}
        >
          Next →
        </Link>
      ) : (
        <span aria-disabled="true" className={`${edgeClass} opacity-50`}>
          Next →
        </span>
      )}
    </nav>
  );
}
