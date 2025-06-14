"use client";
import Link from "next/link";
import {
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs";

const serialize = createSerializer({
  month: parseAsString,
  categories: parseAsArrayOf(parseAsString),
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  search: parseAsString,
});

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
  onPageNumberChange: (pageNumber: number) => void;
}) {
  const navigationToPrevPageAllowed = currentPage - 1 > 0;
  const navigationToNextPageAllowed = currentPage + 1 <= totalPages;

  const pages: Array<number> = [];
  let pushedMiddle = false;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push(i);
    } else if (!pushedMiddle) {
      pages.push(0);
      pushedMiddle = true;
    }
  }

  return (
    <div className="flex items-center justify-center gap-0 md:gap-4">
      <ConditionalLink
        href={serialize({
          month: selectedMonth,
          categories:
            selectedCategoriesIds.length === 0 ? null : selectedCategoriesIds,
          page: Math.max(currentPage - 1, 1),
          search,
        })}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          onPageNumberChange(Math.max(currentPage - 1, 1));
        }}
        condition={navigationToPrevPageAllowed}
      >
        <button
          disabled={!navigationToPrevPageAllowed}
          className="hidden md:flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-gray-900 uppercase align-middle transition-all rounded-lg select-none hover:bg-darkPurple/10 active:bg-darkPurple disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Previous
        </button>
      </ConditionalLink>
      <div className="flex items-center gap-0 md:gap-2">
        {pages.map((page) => (
          <Link
            key={page}
            href={serialize({
              month: selectedMonth,
              categories:
                selectedCategoriesIds.length === 0
                  ? null
                  : selectedCategoriesIds,
              page: page,
              search,
            })}
            onClick={(e) => {
              e.preventDefault();
              onPageNumberChange(page);
            }}
          >
            <button
              className={`${page === currentPage ? "bg-darkPurple relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg  text-center align-middle font-sans text-xs font-medium uppercase text-white shadow-md  hover:shadow-lg hover:bg-darkPurple focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" : "relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 hover:bg-darkPurple/10 active:bg-darkPurple/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"}`}
              type="button"
            >
              <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                {page === 0 ? "..." : page}
              </span>
            </button>
          </Link>
        ))}
      </div>
      <ConditionalLink
        href={serialize({
          month: selectedMonth,
          categories:
            selectedCategoriesIds.length === 0 ? null : selectedCategoriesIds,
          page: currentPage + 1,
          search,
        })}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          onPageNumberChange(currentPage + 1);
        }}
        condition={navigationToNextPageAllowed}
      >
        <button
          disabled={!navigationToNextPageAllowed}
          className="hidden md:flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-gray-900 uppercase align-middle rounded-lg select-none hover:bg-darkPurple/10 active:bg-darkPurple/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </ConditionalLink>
    </div>
  );
}

// @ts-expect-error TODO(lforst): leftover from migration
function ConditionalLink({ children, condition, onClick, ...props }) {
  return condition ? (
    // @ts-ignore
    <Link onClick={onClick} {...props}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}
