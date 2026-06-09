"use cache";

import * as Sentry from "@sentry/nextjs";
import { and, desc, eq, inArray, not } from "drizzle-orm";
import type { Element } from "hast";
import { cacheTag } from "next/cache";
import { serialize } from "next-mdx-remote/serialize";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { ChangelogEntry } from "@/client/components/list";
import { db } from "@/server/db";
import {
  _CategoryToChangelog,
  Category,
  type CategoryModel,
  Changelog,
  type ChangelogModel,
} from "@/server/db/schema";

type ChangelogWithCategories = ChangelogModel & {
  categories: CategoryModel[];
};

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

export async function getChangelogs(): Promise<ChangelogWithCategories[]> {
  cacheTag("changelogs");
  try {
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

export async function getChangelogSummaries(): Promise<ChangelogEntry[]> {
  cacheTag("changelogs");
  const changelogs = await getChangelogs();

  const entries = await Promise.all(
    changelogs
      .filter((changelog) => changelog.publishedAt !== null)
      .map(async (changelog): Promise<ChangelogEntry | null> => {
        try {
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
        } catch (e) {
          // A single entry with malformed MDX should not crash the whole list.
          // Report the real compile error (with the offending slug) to Sentry
          // instead of letting it bubble up as the opaque digest error.
          Sentry.captureException(e, {
            tags: { changelog_stage: "getChangelogSummaries" },
            extra: { changelogId: changelog.id, slug: changelog.slug },
          });
          return null;
        }
      }),
  );

  return entries.filter((entry): entry is ChangelogEntry => entry !== null);
}

export async function getChangelog(
  slug: string,
): Promise<ChangelogWithCategories | null> {
  cacheTag("changelog-detail");
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
  } catch (_e) {
    return null;
  }
}

export async function getRecentChangelogs(excludeSlug: string) {
  cacheTag("changelogs");
  try {
    const changelogs = await db
      .select()
      .from(Changelog)
      .where(
        and(
          eq(Changelog.published, true),
          eq(Changelog.deleted, false),
          not(eq(Changelog.slug, excludeSlug)),
        ),
      )
      .orderBy(desc(Changelog.publishedAt))
      .limit(3);

    const categoryMap = await getChangelogCategoryMap(
      changelogs.map((row) => row.id),
    );

    return changelogs.map((changelog) => ({
      ...changelog,
      categories: categoryMap.get(changelog.id) ?? [],
    }));
  } catch (_e) {
    return [];
  }
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
