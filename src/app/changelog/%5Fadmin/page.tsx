import { PlusIcon } from "@radix-ui/react-icons";
import { Button, Text } from "@radix-ui/themes";
import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Fragment } from "react";
import {
  deleteChangelog,
  publishChangelog,
  unpublishChangelog,
} from "@/server/actions/changelog";
import { authOptions } from "@/server/authOptions";
import { db } from "@/server/db";
import {
  _CategoryToChangelog,
  Category,
  Changelog,
  User,
} from "@/server/db/schema";
import Confirm from "./confirm";

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

  const changelogs = changelogsRaw.map((changelog) => ({
    id: changelog.id,
    title: changelog.title,
    slug: changelog.slug,
    deleted: changelog.deleted,
    createdAt: changelog.createdAt,
    publishedAt: changelog.publishedAt,
    published: changelog.published,
    authorId: changelog.authorId,
    author:
      changelog.authorName || changelog.authorEmail
        ? {
            id: changelog.authorId,
            name: changelog.authorName,
            email: changelog.authorEmail,
          }
        : null,
    categories: categoriesMap.get(changelog.id) ?? [],
  }));

  return (
    <Fragment>
      <header className="text-left pl-4 mb-4">
        <p>
          <Link href="/changelog" className="underline">
            « Back to changelogs
          </Link>
        </p>
        <Button>
          <PlusIcon />
          <Link href="/changelog/_admin/create">New Changelog</Link>
        </Button>
        <p>Post Guidelines</p>
        <ul>
          <li>
            - Be very matter of fact, direct, and simple. Avoid using words like
            "excited to announce".
          </li>
          <li>- Spell out the what, the why, and how to use it.</li>
          <li>
            - Avoid exclamation points, adjectives, references to competition,
            and personal opinions.
          </li>
        </ul>
      </header>

      <table className="table-fixed w-11/12 mx-auto text-sm text-left text-gray-500">
        <colgroup>
          <col style={{ width: "30%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="whitespace-nowrap px-4 py-2">Title</th>
            <th className="px-4 py-2 break-words">Categories</th>
            <th className="whitespace-nowrap px-4 py-2">Published by</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white border-b hover:bg-gray-50 dark:hover:bg-gray-600">
          {changelogs.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="text-center font-medium text-gray-900 whitespace-nowrap"
              >
                No changelogs found
              </td>
            </tr>
          )}

          {changelogs.map((changelog) => (
            <tr
              key={changelog.id}
              className="bg-white border-b hover:bg-gray-50"
            >
              <td className="px-6 py-2 font-medium text-gray-900">
                {changelog.title}
                {changelog.deleted && (
                  <span className="ml-2 text-xs font-normal text-red-500">
                    (deleted)
                  </span>
                )}
              </td>

              <td className="px-4 py-2 break-words">
                {changelog.categories.map((category) => (
                  <div
                    key={category.id}
                    className="inline whitespace-nowrap p-2 uppercase shadow-sm no-underline rounded-full text-red text-xs mr-1 mb-4 bg-gray-100"
                  >
                    {category.name}
                  </div>
                ))}
              </td>
              <td className="px-4 py-2 text-center">
                {changelog.published && (
                  <span className="text-gray-500">
                    <Text size="1">
                      {" "}
                      {new Date(changelog.publishedAt || "").toLocaleDateString(
                        "en-EN",
                        {
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        },
                      )}
                    </Text>
                    <br />
                  </span>
                )}
                <Text size="1">{changelog.author?.name}</Text>
              </td>

              <td className="px-4 py-2">
                <div className="flex h-full justify-end">
                  <Link
                    href={`/changelog/${changelog.slug}`}
                    className="text-indigo-600 hover:bg-indigo-100 rounded-md px-1 py-2 text-xs whitespace-nowrap"
                  >
                    👀 Show
                  </Link>
                  <Link
                    href={`/changelog/_admin/${changelog.id}/edit`}
                    className="text-indigo-600 hover:bg-indigo-100 rounded-md px-1 py-2 text-xs whitespace-nowrap"
                  >
                    📝 Edit
                  </Link>
                  {changelog.published ? (
                    <Confirm action={unpublishChangelog} changelog={changelog}>
                      ⛔️ Unpublish?
                    </Confirm>
                  ) : (
                    <Confirm action={publishChangelog} changelog={changelog}>
                      ✅ Publish?
                    </Confirm>
                  )}
                  <Confirm action={deleteChangelog} changelog={changelog}>
                    💀 Delete?
                  </Confirm>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
}
