import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { CreateChangelogForm } from "@/client/components/forms/createChangelogForm";
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

  return (
    <section className="overflow-x-auto col-start-3 col-span-8">
      <CreateChangelogForm categories={categories} />
    </section>
  );
}
