import { prismaClient } from "@/server/prisma-client";
import type { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 100;

function isValidDate(str: string): boolean {
  const date = Date.parse(str);
  return !Number.isNaN(date);
}

function sanitizeSearch(term: string): string {
  // Remove PostgreSQL full-text search operators and limit length
  return term
    .replace(/[&|!:*()\\<>]/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
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

    const where: Prisma.ChangelogWhereInput = {
      published: true,
      ...(category && { categories: { some: { name: category } } }),
      ...((from || to) && {
        publishedAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
      ...(search && {
        OR: [{ title: { search } }, { summary: { search } }],
      }),
    };

    const changelogs = await prismaClient.changelog.findMany({
      where,
      include: { categories: { select: { id: true, name: true } } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(changelogs);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch changelogs" },
      { status: 500 },
    );
  }
}
