import type { Metadata } from "next";
import { connection } from "next/server";
import { Fragment } from "react";
import { ChangelogList } from "@/client/components/list";
import { getChangelogSummaries } from "../../server/utils";
import Header from "./header";

export default async function Page() {
  await connection();
  const changelogs = await getChangelogSummaries();

  return (
    <Fragment>
      <Header />
      <ChangelogList changelogs={changelogs} />
    </Fragment>
  );
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
