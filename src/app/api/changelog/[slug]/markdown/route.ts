import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { Changelog, type ChangelogModel } from "@/server/db/schema";
import { getChangelog } from "@/server/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let changelog:
    | Pick<ChangelogModel, "title" | "content" | "publishedAt">
    | null
    | undefined;
  if (process.env.VERCEL_ENV === "preview") {
    const entry = await getChangelog(slug);
    changelog = entry?.published ? entry : null;
  } else {
    [changelog] = await db
      .select({
        title: Changelog.title,
        content: Changelog.content,
        publishedAt: Changelog.publishedAt,
      })
      .from(Changelog)
      .where(and(eq(Changelog.slug, slug), eq(Changelog.published, true)))
      .limit(1);
  }

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
