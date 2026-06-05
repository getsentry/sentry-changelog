import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { Fragment } from "react";
import { EditChangelogForm } from "@/client/components/forms/editChangelogForm";
import { db } from "@/server/db";
import { _CategoryToChangelog, Category, Changelog } from "@/server/db/schema";

export default async function ChangelogCreatePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const categories = await db
    .select()
    .from(Category)
    .orderBy(asc(Category.name));

  const changelogs = await db
    .select()
    .from(Changelog)
    .where(eq(Changelog.id, params.id));

  const changelogCategories = await db
    .select({
      id: Category.id,
      name: Category.name,
      deleted: Category.deleted,
    })
    .from(_CategoryToChangelog)
    .innerJoin(Category, eq(_CategoryToChangelog.A, Category.id))
    .where(eq(_CategoryToChangelog.B, params.id));

  const changelog = changelogs[0]
    ? {
        ...changelogs[0],
        categories: changelogCategories,
      }
    : null;

  if (!changelog) {
    return (
      <Fragment>
        <header>
          <h2>Changelog not found</h2>
        </header>
        <footer>
          <Link href="/changelog/_admin">Return to Changelogs list</Link>
        </footer>
      </Fragment>
    );
  }

  return (
    <section className="overflow-x-auto col-start-3 col-span-8">
      <EditChangelogForm changelog={changelog} categories={categories} />
    </section>
  );
}
