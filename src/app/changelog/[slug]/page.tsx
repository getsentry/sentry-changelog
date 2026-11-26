import type { Metadata, ResolvingMetadata } from "next";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ChangelogImage } from "@/client/components/changelogImage";
import { DateComponent } from "@/client/components/date";
import { authOptions } from "@/server/authOptions";
import type { ChangelogModel as Changelog } from "@/server/db/schema";
import {
  getChangelog,
  getChangelogs,
  getRecentChangelogs,
} from "@/server/utils";
import { ChangelogArticle } from "./changelogArticle";

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
