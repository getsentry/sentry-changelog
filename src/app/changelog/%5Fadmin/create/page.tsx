import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ChangelogForm } from "@/client/components/forms/changelogForm";
import { authOptions } from "@/server/authOptions";
import { db } from "@/server/db";
import { Category } from "@/server/db/schema";

export default async function ChangelogCreatePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return notFound();
  }

  const categories = await db
    .select()
    .from(Category)
    .orderBy(asc(Category.name));

  return <ChangelogForm categories={categories} />;
}
