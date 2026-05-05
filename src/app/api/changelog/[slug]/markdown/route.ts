import { NextResponse } from "next/server";
import { prismaClient } from "@/server/prisma-client";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const changelog = await prismaClient.changelog.findUnique({
    where: { slug, published: true },
    select: { title: true, content: true, publishedAt: true },
  });

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
