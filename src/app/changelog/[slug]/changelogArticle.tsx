import * as Sentry from "@sentry/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import ArticleFooter from "@/client/components/articleFooter";
import { ChangelogImage } from "@/client/components/changelogImage";
import { CopyPageButton } from "@/client/components/copyPageButton";
import { DateComponent } from "@/client/components/date";
import { ShareButtons } from "@/client/components/shareButtons";
import { changelogTag } from "@/server/changelog-cache";
import { mdxOptions } from "@/server/mdxOptions";
import type { getChangelog } from "@/server/utils";

function estimateReadTime(content: string | null | undefined): string {
  if (!content) return "";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export async function ChangelogArticle({
  changelog,
  children,
}: {
  changelog: NonNullable<Awaited<ReturnType<typeof getChangelog>>>;
  children?: ReactNode;
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
