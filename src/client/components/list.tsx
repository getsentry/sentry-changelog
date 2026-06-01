"use client";

import type { Category } from "@prisma/client";
import Link from "next/link";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { Fragment, useState } from "react";
import { Article } from "./article";
import { Pagination } from "./pagination";

const ENTRIES_PER_PAGE = 10;

export type ChangelogEntry = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  image?: string | null | undefined;
  publishedAt: string; // Dates are passed to client components serialized as strings
  categories: Category[];
  mdxSummary: MDXRemoteSerializeResult;
};

function changelogEntryPublishDateToAddressableTag(date: Date) {
  return date.toLocaleString("en-EN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ChangelogList({
  changelogs,
}: {
  changelogs: ChangelogEntry[];
}) {
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [, setQuerySearchValue] = useQueryState("search", parseAsString);

  const [monthAndYearParam, setMonthParam] = useQueryState("month");
  const [selectedCategoriesIds] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ clearOnDefault: true }),
  );
  const [pageParam, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const selectedPage = pageParam === null ? 1 : pageParam;

  const filteredChangelogsWithoutMonthFilter = changelogs
    .filter((changelog) => {
      if (selectedCategoriesIds.length === 0) return true;
      return changelog.categories.some((changelogCategory) =>
        selectedCategoriesIds.includes(changelogCategory.id),
      );
    })
    .filter((changelog) => {
      if (searchValue === null) return true;
      const addressableDate = changelogEntryPublishDateToAddressableTag(
        new Date(changelog.publishedAt),
      );
      const concatenatedCategories = changelog.categories
        .map((category: Category) => category.name)
        .join(" ");
      const searchableContent =
        changelog.title +
        changelog.summary +
        concatenatedCategories +
        addressableDate;
      return searchableContent
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const filteredChangelogs = filteredChangelogsWithoutMonthFilter.filter(
    (changelog) => {
      if (monthAndYearParam == null) return true;
      const addressableDate = changelogEntryPublishDateToAddressableTag(
        new Date(changelog.publishedAt),
      );
      return monthAndYearParam === addressableDate;
    },
  );

  const allChangelogCategories: Record<string, Category> = {};
  for (const changelog of changelogs) {
    for (const category of changelog.categories) {
      allChangelogCategories[category.id] = category;
    }
  }

  const datesGroupedByMonthAndYear = new Set<string>();
  for (const changelog of changelogs) {
    if (changelog.publishedAt === null) {
      throw new Error("invariant");
    }
    datesGroupedByMonthAndYear.add(
      changelogEntryPublishDateToAddressableTag(
        new Date(changelog.publishedAt),
      ),
    );
  }

  const sortedDatesGroupedByMonthAndYear = [...datesGroupedByMonthAndYear].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const numberOfPages = Math.ceil(filteredChangelogs.length / ENTRIES_PER_PAGE);

  const paginatedChangelogs = filteredChangelogs
    .slice(
      ENTRIES_PER_PAGE * (selectedPage - 1),
      ENTRIES_PER_PAGE * selectedPage,
    )
    .map((changelog, i, arr) => {
      const monthYear = changelogEntryPublishDateToAddressableTag(
        new Date(changelog.publishedAt),
      );

      const prevChangelog: ChangelogEntry | undefined = arr[i - 1];
      const prevChangelogHasDifferentMonth =
        !prevChangelog ||
        changelogEntryPublishDateToAddressableTag(
          new Date(prevChangelog.publishedAt),
        ) !==
          changelogEntryPublishDateToAddressableTag(
            new Date(changelog.publishedAt),
          );

      return (
        <Fragment key={changelog.id}>
          {prevChangelogHasDifferentMonth && (
            <div className="flex items-center gap-3 mt-8 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap">
                {monthYear}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          )}
          <Link href={`/changelog/${changelog.slug}`} className="block group">
            <Article
              key={changelog.id}
              slug={changelog.slug}
              date={changelog.publishedAt}
              title={changelog.title}
              tags={[]}
              image={changelog.image}
            >
              <MDXRemote {...changelog.mdxSummary} />
            </Article>
          </Link>
        </Fragment>
      );
    });

  const visibleMonths = sortedDatesGroupedByMonthAndYear.filter(
    (monthAndYear) =>
      filteredChangelogsWithoutMonthFilter.some(
        (changelog) =>
          changelogEntryPublishDateToAddressableTag(
            new Date(changelog.publishedAt),
          ) === monthAndYear,
      ),
  );

  return (
    <main className="w-full bg-darkPurple min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Mobile search + month dropdown */}
        <div className="py-4 border-b border-white/10 sm:hidden flex flex-col gap-3">
          <search className="relative">
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
              type="text"
              value={searchValue ?? ""}
              onChange={(e) => {
                setPageParam(null);
                const newSearchValue = e.target.value ? e.target.value : null;
                setSearchValue(newSearchValue);
                setQuerySearchValue(newSearchValue);
              }}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-white/25 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#fd44b0]"
            />
          </search>
          {visibleMonths.length > 0 && (
            <select
              aria-label="Filter by month"
              value={monthAndYearParam ?? ""}
              onChange={(e) => {
                setMonthParam(e.target.value || null);
                setPageParam(null);
              }}
              className="w-full text-xs rounded-lg border border-white/25 bg-white/10 text-white px-2 py-1.5 focus:outline-none focus:border-[#fd44b0] appearance-none"
            >
              <option value="" className="bg-darkPurple text-white">
                All months
              </option>
              {visibleMonths.map((monthAndYear) => (
                <option
                  key={monthAndYear}
                  value={monthAndYear}
                  className="bg-darkPurple text-white"
                >
                  {monthAndYear}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Two-column layout on desktop */}
        <div className="sm:flex sm:gap-10">
          {/* Feed */}
          <div className="flex-1 min-w-0 pb-10">
            {paginatedChangelogs}

            {paginatedChangelogs.length === 0 && (
              <div className="flex items-center gap-3 my-10">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/40">No posts found.</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}

            {numberOfPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={selectedPage}
                  totalPages={numberOfPages}
                  onPageNumberChange={(pageNumber) => {
                    setPageParam(pageNumber, { history: "push" });
                  }}
                  search={searchValue}
                  selectedMonth={monthAndYearParam}
                  selectedCategoriesIds={selectedCategoriesIds}
                />
              </div>
            )}
          </div>

          {/* Right sidebar — search + date navigator, desktop only */}
          <div className="hidden sm:block w-40 flex-shrink-0">
            <div className="sticky top-[7rem] pt-6">
              <search className="relative mb-6">
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
                  type="text"
                  value={searchValue ?? ""}
                  onChange={(e) => {
                    setPageParam(null);
                    const newSearchValue = e.target.value
                      ? e.target.value
                      : null;
                    setSearchValue(newSearchValue);
                    setQuerySearchValue(newSearchValue);
                  }}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-white/25 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#fd44b0]"
                />
              </search>
              {visibleMonths.length > 0 && (
                <>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Jump to
                  </span>
                  <div className="mt-3 flex flex-col gap-2">
                    {visibleMonths.map((monthAndYear) => (
                      <button
                        key={monthAndYear}
                        type="button"
                        onClick={() => {
                          if (monthAndYearParam === monthAndYear) {
                            setMonthParam(null);
                          } else {
                            setMonthParam(monthAndYear);
                          }
                          setPageParam(null);
                        }}
                        className={`text-left text-xs transition-colors duration-150 ${
                          monthAndYearParam === monthAndYear
                            ? "text-[#fd44b0] font-semibold"
                            : "text-white/65 hover:text-white"
                        }`}
                      >
                        {monthAndYear}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
