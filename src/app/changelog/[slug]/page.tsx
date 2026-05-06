import type { Changelog } from "@prisma/client";
import type { Metadata, ResolvingMetadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import ArticleFooter from "@/client/components/articleFooter";
import { CopyPageButton } from "@/client/components/copyPageButton";
import { DateComponent } from "@/client/components/date";
import { ShareButtons } from "@/client/components/shareButtons";
import { TableOfContents } from "@/client/components/tableOfContents";
import { authOptions } from "@/server/authOptions";
import { mdxOptions } from "@/server/mdxOptions";
import { prismaClient } from "@/server/prisma-client";

export const dynamic = "force-dynamic";

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

const getChangelog = unstable_cache(
  async (slug) => {
    try {
      return await prismaClient.changelog.findUnique({
        where: { slug },
        include: { categories: true },
      });
    } catch (_e) {
      return null;
    }
  },
  ["changelog-detail"],
  { tags: ["changelog-detail"] },
);

const getRecentChangelogs = unstable_cache(
  async (excludeSlug: string) => {
    try {
      return await prismaClient.changelog.findMany({
        where: { published: true, slug: { not: excludeSlug } },
        include: { categories: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      });
    } catch (_e) {
      return [];
    }
  },
  ["changelog-related"],
  { tags: ["changelogs"] },
);

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
  const [changelog, relatedEntries] = await Promise.all([
    getChangelog(params.slug),
    getRecentChangelogs(params.slug),
  ]);

  if (!changelog) {
    notFound();
  }

  if (!changelog.published) {
    const session = await getServerSession(authOptions);
    if (!session) {
      notFound();
    }
  }

  const readTime = estimateReadTime(changelog.content);

  return (
    <div className="bg-white min-h-screen">
      {/* Full-bleed hero image */}
      {changelog.image && (
        // biome-ignore lint/performance/noImgElement: next/image doesn't resolve here
        <img
          src={changelog.image}
          alt={changelog.title ?? ""}
          className="w-full max-h-[480px] object-cover"
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link + share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/changelog/"
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

        {/* Two-column layout: content + TOC */}
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
          {/* Main content */}
          <div>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-blog-text leading-tight mb-4">
              {changelog.title}
            </h1>

            {/* Metadata strip */}
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

            {/* MDX body */}
            <div className="prose prose-lg max-w-none blog-prose blog-content">
              <Suspense fallback="Loading...">
                <MDXRemote
                  source={changelog.content ?? "No content found."}
                  options={{ mdxOptions } as any}
                />
              </Suspense>
            </div>

            {/* Footer CTA */}
            <div className="mt-12">
              <ArticleFooter />
            </div>
          </div>

          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <TableOfContents contentSelector=".blog-content" />
            </div>
          </aside>
        </div>

        {/* Related entries */}
        {relatedEntries.length > 0 && (
          <section className="mt-16 pt-10 border-t border-blog-border">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-blog-muted mb-6">
              Recent entries
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/changelog/${entry.slug}`}
                  className="group block bg-white border border-blog-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {entry.image && (
                    // biome-ignore lint/performance/noImgElement: next/image doesn't resolve here
                    <img
                      src={entry.image}
                      alt={entry.title ?? ""}
                      className="w-full aspect-video object-cover"
                    />
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
        )}
      </div>
    </div>
  );
}
