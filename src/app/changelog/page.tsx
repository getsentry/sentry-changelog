import { startSpan } from "@sentry/nextjs";
import type { Element } from "hast";
import type { Metadata } from "next";
import { connection } from "next/server";
import { serialize } from "next-mdx-remote/serialize";
import { Fragment } from "react";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { type ChangelogEntry, ChangelogList } from "@/client/components/list";
import { getChangelogs } from "../../server/utils";
import Header from "./header";

export default async function Page() {
  await connection();
  const changelogs = await getChangelogs();

  const changelogsWithPublishedAt = changelogs.filter((changelog) => {
    return changelog.publishedAt !== null;
  });

  const changelogsWithMdxSummaries = await startSpan(
    { name: "serialize changelog summaries" },
    () =>
      Promise.all(
        changelogsWithPublishedAt.map(
          async (changelog): Promise<ChangelogEntry> => {
            const mdxSummary = await serialize(
              changelog.summary || "",
              {
                mdxOptions: {
                  rehypePlugins: [
                    // @ts-expect-error
                    stripLinks,
                  ],
                },
              },
              true,
            );
            return {
              id: changelog.id,
              title: changelog.title,
              slug: changelog.slug,
              publishedAt: new Date(changelog.publishedAt!).toUTCString(),
              categories: changelog.categories,
              mdxSummary,
            };
          },
        ),
      ),
  );

  return (
    <Fragment>
      <Header />
      <ChangelogList changelogs={changelogsWithMdxSummaries} />
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

const stripLinks: Plugin = () => {
  return (tree) => {
    return visit(tree, "element", (node: Element) => {
      if (node.tagName === "a") {
        node.tagName = "span";
        if (node.properties) {
          node.properties.href = undefined;
          node.properties.class = undefined;
        }
      }
    });
  };
};
