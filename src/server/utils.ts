"use cache";

import type { Element } from "hast";
import { cacheTag } from "next/cache";
import { serialize } from "next-mdx-remote/serialize";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { ChangelogEntry } from "@/client/components/list";
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

export async function getChangelogSummaries(): Promise<ChangelogEntry[]> {
  cacheTag("changelogs");
  const changelogs = await getChangelogs();

  return Promise.all(
    changelogs
      .filter((changelog) => changelog.publishedAt !== null)
      .map(async (changelog): Promise<ChangelogEntry> => {
        const mdxSummary = await serialize(
          changelog.summary || "",
          {
            mdxOptions: {
              rehypePlugins: [
                // @ts-expect-error
                stripLinks,
              ],
            },
          },
          true,
        );
        return {
          id: changelog.id,
          title: changelog.title,
          slug: changelog.slug,
          publishedAt: new Date(changelog.publishedAt!).toUTCString(),
          categories: changelog.categories,
          mdxSummary,
        };
      }),
  );
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

const stripLinks: Plugin = () => {
  return (tree) => {
    return visit(tree, "element", (node: Element) => {
      if (node.tagName === "a") {
        node.tagName = "span";
        if (node.properties) {
          node.properties.href = undefined;
          node.properties.class = undefined;
        }
      }
    });
  };
};
