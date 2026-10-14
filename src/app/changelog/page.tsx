import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import { ChangelogList } from "@/client/components/list";
import { getChangelogSummaries } from "../../server/utils";
import { FeedSkeleton } from "./feedSkeleton";
import Header from "./header";

export default function Page() {
  // Cached database data is available during prerendering. The list retains
  // its own Suspense boundary for URL filters, with real articles as fallback.
  return (
    <Fragment>
      <Header />
      <Suspense fallback={<FeedSkeleton />}>
        <ChangelogFeed />
      </Suspense>
    </Fragment>
  );
}

async function ChangelogFeed() {
  const changelogs = await getChangelogSummaries();

  return <ChangelogList changelogs={changelogs} />;
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
