import { connection, NextResponse } from "next/server";
import { prismaClient } from "@/server/prisma-client";

export async function GET() {
  await connection();

  const changelogs = await prismaClient.changelog.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: { title: true, slug: true, summary: true, publishedAt: true },
  });

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
