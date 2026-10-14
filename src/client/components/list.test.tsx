import { serialize } from "next-mdx-remote/serialize";
import { unstable_createAdapterProvider } from "nuqs/adapters/custom";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { createElement, Suspense } from "react";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { type ChangelogEntry, ChangelogList } from "./list";

// Model Next's request-only URL read at the adapter boundary.
const StaticAdapter = unstable_createAdapterProvider(() => {
  throw new Promise(() => {});
});

let entries: ChangelogEntry[];
beforeAll(async () => {
  const mdxSummary = await serialize("An **article** summary.");
  entries = Array.from({ length: 12 }, (_, index) => ({
    id: String(index),
    title: `Release ${index + 1}`,
    slug: `release-${index + 1}`,
    publishedAt: new Date(Date.UTC(2026, 9, 13 - index)).toUTCString(),
    categories: [],
    mdxSummary,
  }));
});

describe("statically rendered changelog feed", () => {
  it("includes the first ten articles while URL state is unavailable", () => {
    const html = renderToString(
      createElement(
        StaticAdapter,
        null,
        createElement(
          Suspense,
          { fallback: "Loading feed" },
          createElement(ChangelogList, { changelogs: entries }),
        ),
      ),
    );
    expect(html).toContain('href="/changelog/release-1"');
    expect(html).toContain('href="/changelog/release-10"');
    expect(html).not.toContain('href="/changelog/release-11"');
    expect(html).toContain("<strong>article</strong>");
  });

  it("restores the search term from the URL when returning to the feed", () => {
    const html = renderToString(
      <NuqsTestingAdapter searchParams="?search=Release%2012">
        <ChangelogList changelogs={entries} />
      </NuqsTestingAdapter>,
    );
    expect(html).toContain('href="/changelog/release-12"');
    expect(html).not.toContain('href="/changelog/release-1"');
    expect(html).toContain('value="Release 12"');
  });

  it("restores pagination from the URL", () => {
    const html = renderToString(
      <NuqsTestingAdapter searchParams="?page=2">
        <ChangelogList changelogs={entries} />
      </NuqsTestingAdapter>,
    );
    expect(html).toContain('href="/changelog/release-11"');
    expect(html).toContain('href="/changelog/release-12"');
    expect(html).not.toContain('href="/changelog/release-1"');
  });
});
