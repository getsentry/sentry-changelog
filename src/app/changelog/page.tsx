import type { Metadata } from "next";
import { connection } from "next/server";
import { Fragment, Suspense } from "react";
import { ChangelogList } from "@/client/components/list";
import { getChangelogSummaries } from "../../server/utils";
import { FeedSkeleton } from "./feedSkeleton";
import Header from "./header";

export default function Page() {
  // Keep the header + document metadata in a statically-prerenderable shell and
  // stream the dynamic, search-param-driven feed inside an explicit Suspense
  // boundary. Reading URL state (via nuqs/useSearchParams in <ChangelogList />)
  // outside of a Suspense boundary makes the prerendered tree disagree with the
  // client resume under `cacheComponents`, which surfaced as a hydration
  // mismatch ("Cannot read properties of null (reading 'parentNode')").
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
  await connection();
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
