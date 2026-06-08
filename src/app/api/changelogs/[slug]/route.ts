import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { _CategoryToChangelog, Category, Changelog } from "@/server/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
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
      })
      .from(Changelog)
      .where(
        and(
          eq(Changelog.slug, slug),
          eq(Changelog.published, true),
          eq(Changelog.deleted, false),
        ),
      )
      .limit(1);

    const row = rows[0] ?? null;

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const categoriesRows = await db
      .select({ category: Category })
      .from(_CategoryToChangelog)
      .innerJoin(Category, eq(_CategoryToChangelog.A, Category.id))
      .where(eq(_CategoryToChangelog.B, row.id));

    const changelog = {
      ...row,
      categories: categoriesRows.map((r) => r.category),
    };

    // No explicit Cache-Control: this API is consumed by getsentry for
    // broadcast targeting, where freshness of the platform field matters.
    // Next.js defaults to no-store for dynamic API routes; the admin
    // actions and sync script both call revalidateTag("changelog-detail")
    // but that only busts the Next.js data cache, not an HTTP-level CDN
    // cache, so we intentionally omit a public cache header here.
    return NextResponse.json(changelog);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
      { status: 500 },
    );
  }
}
