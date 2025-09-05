import Link from "next/link";
import { Fragment } from "react";

import { EditChangelogForm } from "@/client/components/forms/editChangelogForm";
import { prismaClient } from "@/server/prisma-client";

export default async function ChangelogCreatePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const categories = await prismaClient.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const changelog = await prismaClient.changelog.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      categories: true,
    },
  });

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
