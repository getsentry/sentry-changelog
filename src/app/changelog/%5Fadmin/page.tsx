import { PlusIcon } from "@radix-ui/react-icons";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Suspense } from "react";
import {
  type ChangelogRow,
  ChangelogTable,
} from "@/client/components/admin/changelogTable";
import { GuidelinesCallout } from "@/client/components/admin/guidelines";
import { getChangelogStatus } from "@/client/components/admin/status";
import { authOptions } from "@/server/authOptions";
import { db } from "@/server/db";
import {
  _CategoryToChangelog,
  Category,
  Changelog,
  User,
} from "@/server/db/schema";

export default async function ChangelogsListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return notFound();
  }

  const changelogsRaw = await db
    .select({
      id: Changelog.id,
      title: Changelog.title,
      slug: Changelog.slug,
      deleted: Changelog.deleted,
      createdAt: Changelog.createdAt,
      publishedAt: Changelog.publishedAt,
      published: Changelog.published,
      authorId: Changelog.authorId,
      authorName: User.name,
      authorEmail: User.email,
      authorImage: User.image,
    })
    .from(Changelog)
    .leftJoin(User, eq(Changelog.authorId, User.id))
    .orderBy(desc(Changelog.createdAt));

  const categoriesRows =
    changelogsRaw.length > 0
      ? await db
          .select({
            changelogId: _CategoryToChangelog.B,
            category: Category,
          })
          .from(_CategoryToChangelog)
          .innerJoin(Category, eq(_CategoryToChangelog.A, Category.id))
          .where(
            inArray(
              _CategoryToChangelog.B,
              changelogsRaw.map((changelog) => changelog.id),
            ),
          )
      : [];

  const categoriesMap = new Map<string, (typeof Category.$inferSelect)[]>();
  for (const row of categoriesRows) {
    const list = categoriesMap.get(row.changelogId) ?? [];
    list.push(row.category);
    categoriesMap.set(row.changelogId, list);
  }

  const rows: ChangelogRow[] = changelogsRaw.map((changelog) => ({
    id: changelog.id,
    title: changelog.title,
    slug: changelog.slug,
    status: getChangelogStatus(changelog),
    createdAt: changelog.createdAt.toISOString(),
    publishedAt: changelog.publishedAt?.toISOString() ?? null,
    authorName: changelog.authorName ?? changelog.authorEmail ?? null,
    authorImage: changelog.authorImage ?? null,
    categories: (categoriesMap.get(changelog.id) ?? []).map((c) => c.name),
  }));

  return (
    <Flex direction="column" gap="5">
      <Flex align="end" justify="between" gap="4" wrap="wrap">
        <div>
          <Heading size="7" weight="bold">
            Posts
          </Heading>
          <Text as="p" size="2" color="gray" mt="1">
            Write, edit, and publish entries for sentry.io/changelog.
          </Text>
        </div>
        <Button asChild size="3">
          <Link href="/changelog/_admin/create">
            <PlusIcon /> New post
          </Link>
        </Button>
      </Flex>

      <GuidelinesCallout />

      <Suspense fallback={null}>
        <ChangelogTable rows={rows} />
      </Suspense>
    </Flex>
  );
}
