import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ChangelogForm } from "@/client/components/forms/changelogForm";
import { authOptions } from "@/server/authOptions";
import { db } from "@/server/db";
import {
  _CategoryToChangelog,
  Category,
  Changelog,
  User,
} from "@/server/db/schema";

export default async function ChangelogEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return notFound();
  }

  const params = await props.params;
  const [categories, changelogs, changelogCategories] = await Promise.all([
    db.select().from(Category).orderBy(asc(Category.name)),
    db
      .select({ changelog: Changelog, authorName: User.name })
      .from(Changelog)
      .leftJoin(User, eq(Changelog.authorId, User.id))
      .where(eq(Changelog.id, params.id)),
    db
      .select({
        id: Category.id,
        name: Category.name,
        deleted: Category.deleted,
      })
      .from(_CategoryToChangelog)
      .innerJoin(Category, eq(_CategoryToChangelog.A, Category.id))
      .where(eq(_CategoryToChangelog.B, params.id)),
  ]);

  const row = changelogs[0];

  if (!row) {
    return (
      <Card size="4" className="mx-auto max-w-md">
        <Flex direction="column" align="center" gap="3" className="text-center">
          <Heading size="5">Post not found</Heading>
          <Text size="2" color="gray">
            It may have been removed, or the link is wrong.
          </Text>
          <Button asChild variant="soft" mt="2">
            <Link href="/changelog/_admin">
              <ArrowLeftIcon /> Back to all posts
            </Link>
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <ChangelogForm
      changelog={{
        ...row.changelog,
        authorName: row.authorName,
        categories: changelogCategories,
      }}
      categories={categories}
    />
  );
}
