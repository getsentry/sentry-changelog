import * as Sentry from "@sentry/nextjs";
import type { Metadata, ResolvingMetadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import ArticleFooter from "@/client/components/articleFooter";
import { ChangelogImage } from "@/client/components/changelogImage";
import { CopyPageButton } from "@/client/components/copyPageButton";
import { DateComponent } from "@/client/components/date";
import { ShareButtons } from "@/client/components/shareButtons";
import { authOptions } from "@/server/authOptions";
import { changelogTag } from "@/server/changelog-cache";
import type { ChangelogModel as Changelog } from "@/server/db/schema";
import { mdxOptions } from "@/server/mdxOptions";
import {
  getChangelog,
  getChangelogs,
  getRecentChangelogs,
} from "@/server/utils";

// Newly published slugs remain available on demand after this build.
export async function generateStaticParams() {
  const changelogs = await getChangelogs();
  // Next 16.3 uses the first validation path's resume cache for on-demand
  // routes. Validate a reserved, missing slug first so that fallback cannot
  // retain a real article's build-time body after targeted revalidation.
  return [
    { slug: "__empty_changelog__" },
    ...changelogs.map(({ slug }) => ({ slug })),
  ];
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  let changelog: Changelog | null = null;
  try {
    changelog = await getChangelog(params.slug);
  } catch (_e) {
    return { title: (await parent).title };
  }

  if (
    changelog &&
    !changelog.published &&
    !(await getServerSession(authOptions))
  ) {
    return { title: (await parent).title };
  }

  return {
    title: changelog?.title,
    description: changelog?.summary,
    alternates: {
      canonical: `https://sentry.io/changelog/${params.slug}`,
    },
    openGraph: {
      images: changelog?.image || (await parent).openGraph?.images,
    },
  };
}

function estimateReadTime(content: string | null | undefined): string {
  if (!content) return "";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export default async function ChangelogEntry(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const changelog = await getChangelog(params.slug);

  if (!changelog) {
    notFound();
  }

  if (!changelog.published) {
    const session = await getServerSession(authOptions);
    if (!session) {
      notFound();
    }
  }

  return (
    <ChangelogArticle changelog={changelog}>
      <RecentEntries slug={params.slug} />
    </ChangelogArticle>
  );
}

async function ChangelogArticle({
  changelog,
  children,
}: {
  changelog: NonNullable<Awaited<ReturnType<typeof getChangelog>>>;
  children: ReactNode;
}) {
  const readTime = estimateReadTime(changelog.content);

  return (
    <div className="bg-white min-h-screen">
      {changelog.image && (
        <ChangelogImage src={changelog.image} alt={changelog.title} hero />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/changelog/"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-sm text-blog-muted hover:text-blog-accent transition-colors duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Changelog
          </Link>
          <div className="sm:hidden">
            <ShareButtons title={changelog.title ?? ""} slug={changelog.slug} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-blog-text leading-tight mb-4">
          {changelog.title}
        </h1>

        <div className="flex items-center gap-4 pb-6 border-b border-blog-border mb-6">
          {changelog.publishedAt && (
            <span className="text-sm text-blog-muted">
              <DateComponent date={changelog.publishedAt} />
            </span>
          )}
          {readTime && (
            <>
              {changelog.publishedAt && (
                <span className="text-blog-border" aria-hidden="true">
                  ·
                </span>
              )}
              <span className="text-sm text-blog-muted">{readTime}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <CopyPageButton
              title={changelog.title ?? ""}
              slug={changelog.slug}
              content={changelog.content ?? ""}
            />
            <div className="hidden sm:block">
              <ShareButtons
                title={changelog.title ?? ""}
                slug={changelog.slug}
              />
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none blog-prose blog-content">
          <ArticleBody slug={changelog.slug} content={changelog.content} />
        </div>

        <div className="mt-12">
          <ArticleFooter />
        </div>

        {children}
      </div>
    </div>
  );
}

async function ArticleBody({
  slug,
  content,
}: {
  slug: string;
  content: string | null;
}) {
  "use cache";
  cacheLife("max");
  cacheTag("changelog-detail", changelogTag(slug));
  try {
    const compiled = await compileMDX({
      source: content ?? "No content found.",
      options: { mdxOptions } as any,
    });
    return compiled.content;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { changelog_stage: "changelogDetailMdx" },
      extra: { slug },
    });
    return <p>This entry could not be displayed.</p>;
  }
}

async function RecentEntries({ slug }: { slug: string }) {
  "use cache";
  cacheTag("changelog-recent");
  const relatedEntries = (await getRecentChangelogs())
    .filter((entry) => entry.slug !== slug)
    .slice(0, 3);
  if (relatedEntries.length === 0) return null;
  return (
    <section className="mt-16 pt-10 border-t border-blog-border">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-blog-muted mb-6">
        Recent entries
      </h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {relatedEntries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/changelog/${entry.slug}`}
            className="group block bg-white border border-blog-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {entry.image && (
              <ChangelogImage src={entry.image} alt={entry.title} />
            )}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-blog-text group-hover:text-blog-accent transition-colors duration-150 line-clamp-2">
                {entry.title}
              </h3>
              {entry.publishedAt && (
                <p className="mt-2 text-xs text-blog-muted">
                  <DateComponent date={entry.publishedAt} />
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
