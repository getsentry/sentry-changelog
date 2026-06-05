import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { prismaClient } from "@/server/prisma-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const changelog = await prismaClient.changelog.findFirst({
      where: { slug, published: true, deleted: false },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        image: true,
        content: true,
        publishedAt: true,
        platform: true,
        categories: { select: { id: true, name: true } },
      },
    });

    if (!changelog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
