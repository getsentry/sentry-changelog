"use cache";

import { cacheTag } from "next/cache";
import { prismaClient } from "@/server/prisma-client";

export async function getChangelogs() {
  cacheTag("changelogs");
  return await prismaClient.changelog.findMany({
    include: {
      categories: true,
    },
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function getChangelog(slug: string) {
  cacheTag("changelog-detail");
  try {
    return await prismaClient.changelog.findUnique({
      where: { slug },
      include: { categories: true },
    });
  } catch (_e) {
    return null;
  }
}

export async function getRecentChangelogs(excludeSlug: string) {
  cacheTag("changelogs");
  try {
    return await prismaClient.changelog.findMany({
      where: { published: true, slug: { not: excludeSlug } },
      include: { categories: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch (_e) {
    return [];
  }
}
