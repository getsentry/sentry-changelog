"use cache";

import * as Sentry from "@sentry/nextjs";
import { and, desc, eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/cache";
import type { ChangelogSummary } from "@/lib/changelog-feed";
import { changelogTag } from "@/server/changelog-cache";
import { db } from "@/server/db";
import { _CategoryToChangelog, Category, Changelog } from "@/server/db/schema";
import {
  type ChangelogWithCategories,
  loadPreviewChangelogs,
} from "@/server/preview-changelogs";

async function getChangelogCategoryMap(
  changelogIds: string[],
): Promise<Map<string, ChangelogWithCategories["categories"]>> {
  if (changelogIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      changelogId: _CategoryToChangelog.B,
      category: Category,
    })
    .from(_CategoryToChangelog)
    .innerJoin(Category, eq(_CategoryToChangelog.A, Category.id))
    .where(inArray(_CategoryToChangelog.B, changelogIds));

  const map = new Map<string, (typeof Category.$inferSelect)[]>();

  for (const row of rows) {
    const list = map.get(row.changelogId) ?? [];
    list.push(row.category);
    map.set(row.changelogId, list);
  }

  return map;
}

async function getPreviewChangelogs(): Promise<ChangelogWithCategories[]> {
  const changelogs = await db.select().from(Changelog);
  const categoryMap = await getChangelogCategoryMap(
    changelogs.map((row) => row.id),
  );
  return loadPreviewChangelogs(
    changelogs.map((changelog) => ({
      ...changelog,
      categories: categoryMap.get(changelog.id) ?? [],
    })),
  );
}

export async function getChangelogs(): Promise<ChangelogWithCategories[]> {
  cacheTag("changelogs");
  try {
    if (process.env.VERCEL_ENV === "preview") {
      return (await getPreviewChangelogs()).filter(
        (changelog) => changelog.published && !changelog.deleted,
      );
    }

    const changelogs = await db
      .select()
      .from(Changelog)
      .where(and(eq(Changelog.published, true), eq(Changelog.deleted, false)))
      .orderBy(desc(Changelog.publishedAt));

    const categoryMap = await getChangelogCategoryMap(
      changelogs.map((row) => row.id),
    );

    return changelogs.map((changelog) => ({
      ...changelog,
      categories: categoryMap.get(changelog.id) ?? [],
    }));
  } catch (e) {
    // Surface the real underlying error (e.g. DB failure) to Sentry instead of
    // the opaque "Server Components render" digest error Next.js would emit.
    Sentry.captureException(e, {
      tags: { changelog_stage: "getChangelogs" },
    });
    throw e;
  }
}

export async function getChangelogSummaries(): Promise<ChangelogSummary[]> {
  cacheTag("changelogs");
  try {
    const preview =
      process.env.VERCEL_ENV === "preview" ? await getChangelogs() : null;
    const rows = preview
      ? preview
      : await db
          .select({
            id: Changelog.id,
            title: Changelog.title,
            slug: Changelog.slug,
            summary: Changelog.summary,
            publishedAt: Changelog.publishedAt,
          })
          .from(Changelog)
          .where(
            and(eq(Changelog.published, true), eq(Changelog.deleted, false)),
          )
          .orderBy(desc(Changelog.publishedAt), desc(Changelog.id));
    const categoryMap = preview
      ? new Map(preview.map((row) => [row.id, row.categories]))
      : await getChangelogCategoryMap(rows.map(({ id }) => id));
    return rows.flatMap((row) => {
      if (!row.publishedAt) return [];
      const categories = categoryMap.get(row.id) ?? [];
      const month = row.publishedAt.toLocaleString("en-EN", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      const summary = row.summary ?? "";
      return [
        {
          id: row.id,
          title: row.title,
          slug: row.slug,
          summary,
          publishedAt: row.publishedAt.toISOString(),
          categories,
          month,
          searchText: [
            row.title,
            summary,
            ...categories.map(({ name }) => name),
            month,
          ]
            .join(" ")
            .toLowerCase(),
        },
      ];
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { changelog_stage: "getChangelogSummaries" },
    });
    throw error;
  }
}

export async function getChangelog(
  slug: string,
): Promise<ChangelogWithCategories | null> {
  cacheTag("changelog-detail", changelogTag(slug));
  if (process.env.VERCEL_ENV === "preview") {
    return (
      (await getPreviewChangelogs()).find(
        (changelog) => changelog.slug === slug && !changelog.deleted,
      ) ?? null
    );
  }

  try {
    const rows = await db
      .select()
      .from(Changelog)
      .where(and(eq(Changelog.slug, slug), eq(Changelog.deleted, false)))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    const changelog = rows[0];
    const categoryMap = await getChangelogCategoryMap([changelog.id]);

    return {
      ...changelog,
      categories: categoryMap.get(changelog.id) ?? [],
    };
  } catch (error) {
    // A temporary database failure must not become a cached static 404.
    Sentry.captureException(error, {
      tags: { changelog_stage: "getChangelog" },
    });
    throw error;
  }
}

// One bounded metadata query shared by every article, rather than a full-body
// query and category join for each excludeSlug during prerendering.
export async function getRecentChangelogs() {
  cacheTag("changelog-recent");
  const fields = {
    slug: Changelog.slug,
    title: Changelog.title,
    image: Changelog.image,
    publishedAt: Changelog.publishedAt,
  };
  if (process.env.VERCEL_ENV === "preview") {
    return (await getPreviewChangelogs())
      .filter((entry) => entry.published && !entry.deleted)
      .slice(0, 4)
      .map(({ slug, title, image, publishedAt }) => ({
        slug,
        title,
        image,
        publishedAt,
      }));
  }
  try {
    return await db
      .select(fields)
      .from(Changelog)
      .where(and(eq(Changelog.published, true), eq(Changelog.deleted, false)))
      .orderBy(desc(Changelog.publishedAt), desc(Changelog.id))
      .limit(4);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { changelog_stage: "getRecentChangelogs" },
    });
    return [];
  }
}
