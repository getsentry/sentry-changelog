import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { Changelog } from "@/server/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const rows = await db
    .select({
      title: Changelog.title,
      content: Changelog.content,
      publishedAt: Changelog.publishedAt,
    })
    .from(Changelog)
    .where(and(eq(Changelog.slug, slug), eq(Changelog.published, true)))
    .limit(1);

  const changelog = rows[0];

  if (!changelog) {
    return new NextResponse("Not found", { status: 404 });
  }

  const date = changelog.publishedAt
    ? changelog.publishedAt.toISOString().split("T")[0]
    : "";

  const markdown = [
    `# ${changelog.title}`,
    "",
    date ? `Published: ${date}` : "",
    date ? "" : null,
    `Source: https://sentry.io/changelog/${slug}`,
    "",
    "---",
    "",
    changelog.content ?? "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
