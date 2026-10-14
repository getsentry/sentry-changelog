import type { Metadata } from "next";
import { createLoader, type SearchParams } from "nuqs/server";
import { Fragment, Suspense } from "react";
import { defaultFeedQuery, feedParsers } from "@/lib/changelog-feed";
import { ChangelogFeed } from "./feed";
import Header from "./header";

const loadFeedQuery = createLoader(feedParsers);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Cached database data is available during prerendering. The list retains
  // its own Suspense boundary for URL filters, with real articles as fallback.
  return (
    <Fragment>
      <Header />
      <Suspense fallback={await ChangelogFeed({ query: defaultFeedQuery })}>
        <QueryFeed searchParams={searchParams} />
      </Suspense>
    </Fragment>
  );
}

async function QueryFeed({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <ChangelogFeed query={await loadFeedQuery(searchParams)} />;
}

export function generateMetadata(): Metadata {
  return {
    description:
      "Stay up to date on everything big and small, from product updates to SDK changes with the Sentry Changelog.",
    alternates: {
      canonical: "https://sentry.io/changelog/",
    },
  };
}
