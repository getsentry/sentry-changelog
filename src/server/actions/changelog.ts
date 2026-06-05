"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../authOptions";
import { prismaClient } from "../prisma-client";
import type { ServerActionPayloadInterface } from "./serverActionPayload.interface";

const unauthorizedPayload: ServerActionPayloadInterface = {
  success: false,
  message: "Unauthorized",
};

export async function unpublishChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;

  try {
    await prismaClient.changelog.update({
      where: { id },
      // Do NOT clear publishedAt — preserving it means a re-publish won't
      // change the entry's chronological position in the sorted list.
      data: { published: false, adminManaged: true },
    });
  } catch (error) {
    console.error("DELETE ACTION ERROR:", error);
    return { message: "Unable to unpublish changelog", success: false };
  }

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
  return { success: true };
}

export async function publishChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;

  try {
    // Preserve the original publishedAt if it exists — re-publishing an entry
    // should keep its chronological position in the sorted list, not stamp now().
    const current = await prismaClient.changelog.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
    await prismaClient.changelog.update({
      where: { id },
      data: {
        published: true,
        // Publishing clears any tombstone so a previously-deleted entry can't
        // go live while still flagged deleted.
        deleted: false,
        publishedAt: current?.publishedAt ?? new Date(),
        adminManaged: true,
      },
    });
  } catch (error) {
    console.error("DELETE ACTION ERROR:", error);
    return { message: "Unable to publish changelog", success: false };
  }

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
  return { success: true };
}

export async function createChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedPayload;
  }
  const categories = formData.getAll("categories");
  await prismaClient.category.createMany({
    data: categories.map((category) => ({ name: category as string })),
    skipDuplicates: true,
  });
  const connect = categories.map((category) => {
    return { name: category as string };
  });

  if (session.user?.email == null) {
    throw new Error("Invariant: Users must have emails");
  }

  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email },
  });

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    summary: formData.get("summary") as string,
    image: formData.get("image") as string,
    slug: formData.get("slug") as string,
    // Created in the UI, so the UI owns it; the file sync will never touch it.
    adminManaged: true,
    // Explicitly null so publishChangelog can distinguish a never-published
    // draft (null) from a re-publish of a previously-published entry (Date).
    // Without this, the schema @default(now()) fills publishedAt at creation
    // time and publishChangelog would incorrectly use that stale timestamp.
    publishedAt: null,
    author: user ? { connect: { id: user.id } } : undefined,
    categories: formData.get("categories") !== "" ? { connect } : {},
  };

  await prismaClient.changelog.create({ data });

  return redirect("/changelog/_admin");
}

export async function editChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;
  const categories = formData.getAll("categories");
  await prismaClient.category.createMany({
    data: categories.map((category) => ({ name: category as string })),
    skipDuplicates: true,
  });
  const connect = categories.map((category) => {
    return { name: category as string };
  });

  try {
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      summary: formData.get("summary") as string,
      image: formData.get("image") as string,
      slug: formData.get("slug") as string,
      // Edited in the UI, so the UI now owns it; future file syncs skip it.
      adminManaged: true,
      categories:
        formData.get("categories") !== "" ? { set: [...connect] } : { set: [] },
    };

    await prismaClient.changelog.update({
      where: { id },
      data,
    });
  } catch (error: any) {
    console.error("EDIT ACTION ERROR:", error);
    return { message: (error as Error).message, success: false };
  }

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  return redirect("/changelog/_admin");
}

export async function deleteChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;
  try {
    // Soft delete: mark deleted + admin-managed instead of removing the row,
    // so the file sync skips it and never re-creates the entry from its file.
    // Do NOT clear publishedAt — preserving it means a restored entry keeps
    // its original chronological position in the sorted list.
    await prismaClient.changelog.update({
      where: { id },
      data: {
        deleted: true,
        published: false,
        adminManaged: true,
      },
    });
  } catch (error) {
    console.error("DELETE ACTION ERROR:", error);
    return { message: "Unable to delete changelog", success: false };
  }

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
  return {
    success: true,
  };
}
