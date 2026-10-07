import { desc, eq } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import { db } from "@/server/db";
import { Changelog } from "@/server/db/schema";
import { getChangelogs } from "@/server/utils";

export async function GET() {
  await connection();

  const changelogs =
    process.env.VERCEL_ENV === "preview"
      ? (await getChangelogs()).slice(0, 20)
      : await db
          .select({
            title: Changelog.title,
            slug: Changelog.slug,
            summary: Changelog.summary,
            publishedAt: Changelog.publishedAt,
          })
          .from(Changelog)
          .where(eq(Changelog.published, true))
          .orderBy(desc(Changelog.publishedAt))
          .limit(20);

  const lines: string[] = [
    "# Sentry Changelog",
    "",
    "Source: https://sentry.io/changelog/",
    "",
    "---",
    "",
  ];

  for (const entry of changelogs) {
    const date = entry.publishedAt
      ? entry.publishedAt.toISOString().split("T")[0]
      : "";
    const url = `https://sentry.io/changelog/${entry.slug}`;
    lines.push(`## [${entry.title}](${url})`);
    if (date) lines.push(`Published: ${date}`);
    lines.push("");
    if (entry.summary) lines.push(entry.summary.trim(), "");
    lines.push("---", "");
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
