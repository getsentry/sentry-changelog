"use client";

import { debounce, useQueryStates } from "nuqs";
import { Suspense, useTransition } from "react";
import { type FeedQuery, feedParsers } from "@/lib/changelog-feed";
import { Pagination } from "./pagination";

type FilterProps = { query: FeedQuery; months: string[]; mobile?: boolean };

export function ChangelogFilters(props: FilterProps) {
  return (
    <Suspense fallback={<FilterFields {...props} />}>
      <QueryFilters {...props} />
    </Suspense>
  );
}

function QueryFilters(props: FilterProps) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useQueryStates(feedParsers, {
    shallow: false,
    startTransition,
  });
  return (
    <FilterFields
      {...props}
      query={query}
      isPending={isPending}
      onSearch={(search) => {
        void setQuery(
          { search, page: 1 },
          { limitUrlUpdates: search ? debounce(250) : undefined },
        );
      }}
      onMonth={(month) => {
        void setQuery({ month, page: 1 });
      }}
    />
  );
}

function FilterFields({
  query,
  months,
  mobile,
  isPending = false,
  onSearch = () => {},
  onMonth = () => {},
}: FilterProps & {
  isPending?: boolean;
  onSearch?: (value: string | null) => void;
  onMonth?: (value: string | null) => void;
}) {
  return (
    <div aria-busy={isPending}>
      <div className={`relative ${mobile ? "" : "mb-6"}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          aria-label="Search..."
          type="search"
          value={query.search ?? ""}
          onChange={(event) => onSearch(event.target.value || null)}
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-white/25 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#fd44b0]"
        />
      </div>
      {mobile
        ? months.length > 0 && (
            <select
              aria-label="Filter by month"
              value={query.month ?? ""}
              onChange={(event) => onMonth(event.target.value || null)}
              className="mt-3 w-full text-xs rounded-lg border border-white/25 bg-white/10 text-white px-2 py-1.5 focus:outline-none focus:border-[#fd44b0] appearance-none"
            >
              <option value="" className="bg-darkPurple text-white">
                All months
              </option>
              {months.map((month) => (
                <option
                  key={month}
                  value={month}
                  className="bg-darkPurple text-white"
                >
                  {month}
                </option>
              ))}
            </select>
          )
        : months.length > 0 && (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                Jump to
              </span>
              <div className="mt-3 flex flex-col gap-2">
                {months.map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() =>
                      onMonth(query.month === month ? null : month)
                    }
                    className={`text-left text-xs transition-colors duration-150 ${query.month === month ? "text-[#fd44b0] font-semibold" : "text-white/65 hover:text-white"}`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </>
          )}
    </div>
  );
}

type PaginationProps = { query: FeedQuery; totalPages: number };

export function FeedPagination(props: PaginationProps) {
  return (
    <Suspense fallback={<PageLinks {...props} />}>
      <QueryPagination {...props} />
    </Suspense>
  );
}

function QueryPagination(props: PaginationProps) {
  const [, startTransition] = useTransition();
  const [query, setQuery] = useQueryStates(feedParsers, {
    shallow: false,
    startTransition,
  });
  return (
    <PageLinks
      {...props}
      query={{ ...query, page: props.query.page }}
      onPage={(page) => {
        void setQuery({ page }, { history: "push" });
      }}
    />
  );
}

function PageLinks({
  query,
  totalPages,
  onPage,
}: PaginationProps & { onPage?: (page: number) => void }) {
  return (
    <Pagination
      currentPage={query.page}
      totalPages={totalPages}
      search={query.search}
      selectedMonth={query.month}
      selectedCategoriesIds={query.categories}
      onPageNumberChange={onPage}
    />
  );
}
