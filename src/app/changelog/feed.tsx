import * as Sentry from "@sentry/nextjs";
import type { Root, RootContent } from "hast";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { Fragment } from "react";
import { Article } from "@/client/components/article";
import { ChangelogFilters, FeedPagination } from "@/client/components/list";
import { type FeedQuery, getFeedPage } from "@/lib/changelog-feed";
import { changelogTag } from "@/server/changelog-cache";
import { getChangelogSummaries } from "@/server/utils";

const stripLinks = () => (tree: Root) => {
  function walk(node: Root | RootContent) {
    if (node.type === "element" && node.tagName === "a") {
      node.tagName = "span";
      node.properties = {};
    }
    if ("children" in node) node.children.forEach(walk);
  }
  walk(tree);
};

async function Summary({ slug, summary }: { slug: string; summary: string }) {
  "use cache";
  cacheLife("max");
  cacheTag("changelog-detail", changelogTag(slug));
  try {
    const { content } = await compileMDX({
      source: summary,
      options: { mdxOptions: { rehypePlugins: [stripLinks] } },
    });
    return content;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { changelog_stage: "getChangelogSummaries" },
      extra: { slug },
    });
    return <p>{summary}</p>;
  }
}

export async function ChangelogFeed({ query }: { query: FeedQuery }) {
  "use cache";
  cacheTag("changelogs");
  const result = getFeedPage(await getChangelogSummaries(), query);

  return (
    <main className="w-full bg-darkPurple min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-4 border-b border-white/10 sm:hidden">
          <ChangelogFilters query={query} months={result.months} mobile />
        </div>
        <div className="sm:flex sm:gap-10">
          <div className="flex-1 min-w-0 pb-10">
            {result.entries.map((entry, index) => (
              <Fragment key={entry.id}>
                {entry.month !== result.entries[index - 1]?.month && (
                  <div className="flex items-center gap-3 mt-8 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap">
                      {entry.month}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
                <Link href={`/changelog/${entry.slug}`} className="block group">
                  <Article date={entry.publishedAt} title={entry.title}>
                    <Summary slug={entry.slug} summary={entry.summary} />
                  </Article>
                </Link>
              </Fragment>
            ))}
            {result.entries.length === 0 && (
              <div className="flex items-center gap-3 my-10">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/40">No posts found.</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}
            {result.totalPages > 1 && (
              <div className="mt-8">
                <FeedPagination
                  query={{ ...query, page: result.page }}
                  totalPages={result.totalPages}
                />
              </div>
            )}
          </div>
          <div className="hidden sm:block w-40 flex-shrink-0">
            <div className="sticky top-[7rem] pt-6">
              <ChangelogFilters query={query} months={result.months} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
