import { unstable_cache } from "next/cache";
import { prismaClient } from "@/server/prisma-client";

export const getChangelogs = unstable_cache(
  async () => {
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
  },
  ["changelogs"],
  { tags: ["changelogs"] },
);
