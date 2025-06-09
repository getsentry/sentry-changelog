import { prismaClient } from "@/server/prisma-client";

import { CreateChangelogForm } from "@/client/components/forms/createChangelogForm";
import { authOptions } from "@/server/authOptions";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";

export default async function ChangelogCreatePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return notFound();
  }

  const categories = await prismaClient.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <section className="overflow-x-auto col-start-3 col-span-8">
      <CreateChangelogForm categories={categories} />
    </section>
  );
}
