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

    return NextResponse.json(changelog, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
      { status: 500 },
    );
  }
}
