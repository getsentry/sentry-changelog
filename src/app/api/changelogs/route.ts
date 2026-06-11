import * as Sentry from "@sentry/nextjs";
import { and, desc, eq, ilike, inArray, or, type SQL, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { _CategoryToChangelog, Category, Changelog } from "@/server/db/schema";

const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 100;

function isValidDate(str: string): boolean {
  const date = Date.parse(str);
  return !Number.isNaN(date);
}

function sanitizeSearch(term: string): string {
  return term.trim().slice(0, MAX_SEARCH_LENGTH);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams
      .get("category")
      ?.slice(0, MAX_CATEGORY_LENGTH);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const searchRaw = searchParams.get("search");
    const search = searchRaw ? sanitizeSearch(searchRaw) : null;
    const limit = Math.min(
      Math.max(1, Number(searchParams.get("limit")) || 20),
      100,
    );
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    if (from && !isValidDate(from)) {
      return NextResponse.json(
        { error: "Invalid 'from' date format" },
        { status: 400 },
      );
    }
    if (to && !isValidDate(to)) {
      return NextResponse.json(
        { error: "Invalid 'to' date format" },
        { status: 400 },
      );
    }

    const whereClauses: SQL<unknown>[] = [
      eq(Changelog.published, true),
      eq(Changelog.deleted, false),
    ];

    if (from || to) {
      if (from)
        whereClauses.push(sql`${Changelog.publishedAt} >= ${new Date(from)}`);
      if (to)
        whereClauses.push(sql`${Changelog.publishedAt} <= ${new Date(to)}`);
    }

    if (search) {
      const safeSearch = `%${search.replace(/[\\%_]/g, "\\$&").replace(/\s+/g, " ")}%`;
      const searchFilter = or(
        ilike(Changelog.title, safeSearch),
        ilike(Changelog.summary, safeSearch),
      );
      if (searchFilter) {
        whereClauses.push(searchFilter);
      }
    }

    if (category) {
      const matchedCategoryChangelogIds = await db
        .selectDistinct({ id: _CategoryToChangelog.B })
        .from(_CategoryToChangelog)
        .innerJoin(Category, eq(Category.id, _CategoryToChangelog.A))
        .where(eq(Category.name, category));

      if (matchedCategoryChangelogIds.length === 0) {
        return NextResponse.json([]);
      }

      const categoryFilter = inArray(
        Changelog.id,
        matchedCategoryChangelogIds.map((row) => row.id),
      );
      if (categoryFilter) {
        whereClauses.push(categoryFilter);
      }
    }

    const rows = await db
      .select({
        id: Changelog.id,
        title: Changelog.title,
        slug: Changelog.slug,
        summary: Changelog.summary,
        image: Changelog.image,
        content: Changelog.content,
        publishedAt: Changelog.publishedAt,
        platform: Changelog.platform,
        broadcastCategory: Changelog.broadcastCategory,
      })
      .from(Changelog)
      .where(and(...whereClauses))
      .orderBy(desc(Changelog.publishedAt))
      .limit(limit)
      .offset(offset);

    const categoriesRows = rows.length
      ? await db
          .select({
            changelogId: _CategoryToChangelog.B,
            category: Category,
          })
          .from(_CategoryToChangelog)
          .innerJoin(Category, eq(_CategoryToChangelog.A, Category.id))
          .where(
            inArray(
              _CategoryToChangelog.B,
              rows.map((row) => row.id),
            ) as SQL<unknown>,
          )
      : [];

    const categoriesByChangelog = new Map<
      string,
      (typeof Category.$inferSelect)[]
    >();

    for (const row of categoriesRows) {
      const list = categoriesByChangelog.get(row.changelogId) ?? [];
      list.push(row.category);
      categoriesByChangelog.set(row.changelogId, list);
    }

    const changelogs = rows.map((row) => ({
      ...row,
      categories: categoriesByChangelog.get(row.id) || [],
    }));

    return NextResponse.json(changelogs);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch changelogs" },
      { status: 500 },
    );
  }
}
