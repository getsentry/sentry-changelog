import {
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import type { CategoryModel } from "@/server/db/schema";

export const feedParsers = {
  search: parseAsString,
  month: parseAsString,
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
};

export const serializeFeedQuery = createSerializer(feedParsers);

export type FeedQuery = {
  search: string | null;
  month: string | null;
  categories: string[];
  page: number;
};

export const defaultFeedQuery: FeedQuery = {
  search: null,
  month: null,
  categories: [],
  page: 1,
};

export type ChangelogSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  categories: CategoryModel[];
  month: string;
  searchText: string;
};

// The index is already sorted by publication date. One pass also builds the
// available months, without formatting dates again for each search or page.
export function getFeedPage(entries: ChangelogSummary[], query: FeedQuery) {
  const search = (query.search ?? "").toLowerCase();
  const months = new Set<string>();
  const matches = entries.filter((entry) => {
    if (
      query.categories.length > 0 &&
      !entry.categories.some(({ id }) => query.categories.includes(id))
    ) {
      return false;
    }
    if (!entry.searchText.includes(search)) return false;
    months.add(entry.month);
    return !query.month || entry.month === query.month;
  });
  const totalPages = Math.ceil(matches.length / 10);
  const page = Math.max(
    1,
    Math.min(
      Number.isSafeInteger(query.page) ? query.page : 1,
      totalPages || 1,
    ),
  );
  return {
    entries: matches.slice((page - 1) * 10, page * 10),
    months: [...months],
    page,
    totalPages,
  };
}
