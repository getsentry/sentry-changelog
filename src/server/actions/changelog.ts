"use server";

import * as Sentry from "@sentry/nextjs";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { isValidPlatform } from "@/lib/platforms";
import { authOptions } from "../authOptions";
import { db } from "../db";
import { _CategoryToChangelog, Category, Changelog, User } from "../db/schema";
import type { ServerActionPayloadInterface } from "./serverActionPayload.interface";

// Keep only known Sentry platform slugs; the form's select is already
// constrained, but guard against stale/forged values reaching the database.
function parsePlatforms(formData: FormData): string[] {
  return formData
    .getAll("platform")
    .map((value) => value as string)
    .filter(isValidPlatform);
}

const unauthorizedPayload: ServerActionPayloadInterface = {
  success: false,
  message: "Unauthorized",
};

// Single gate for every mutating admin action. Returns the session when the
// caller is authenticated; otherwise emits a forensic `warn` log recording the
// rejected attempt. We deliberately don't log the user's email (PII) — the
// action name is enough to spot a pattern of unauthorized access.
async function requireSession(action: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    Sentry.logger.warn(
      Sentry.logger.fmt`Unauthorized changelog ${action} attempt`,
      { "changelog.action": action },
    );
  }
  return session;
}

function getFormCategoryNames(formData: FormData): string[] {
  return formData
    .getAll("categories")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

function uniqueCategoryNames(categories: string[]): string[] {
  return Array.from(new Set(categories));
}

async function syncChangelogCategories(
  changelogId: string,
  categories: string[],
): Promise<void> {
  await db
    .delete(_CategoryToChangelog)
    .where(eq(_CategoryToChangelog.B, changelogId));

  const categoryRows = categories.length
    ? await db
        .select({ id: Category.id })
        .from(Category)
        .where(inArray(Category.name, categories))
    : [];

  if (categoryRows.length === 0) {
    return;
  }

  await db.insert(_CategoryToChangelog).values(
    categoryRows.map((row) => ({
      A: row.id,
      B: changelogId,
    })),
  );
}

export async function unpublishChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await requireSession("unpublish");

  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;

  try {
    await db
      .update(Changelog)
      .set({ published: false, adminManaged: true })
      .where(eq(Changelog.id, id));
  } catch (error) {
    // Recoverable: the action returns a failure payload rather than throwing,
    // so log at `error` level with context instead of surfacing an exception.
    Sentry.logger.error("Failed to unpublish changelog", {
      "changelog.action": "unpublish",
      "changelog.id": id,
      "error.message": (error as Error).message,
    });
    return { message: "Unable to unpublish changelog", success: false };
  }

  Sentry.logger.info(Sentry.logger.fmt`Changelog unpublished: ${id}`, {
    "changelog.action": "unpublish",
    "changelog.id": id,
  });

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
  return { success: true };
}

export async function publishChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await requireSession("publish");

  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;

  try {
    const current =
      (
        await db
          .select({ publishedAt: Changelog.publishedAt })
          .from(Changelog)
          .where(eq(Changelog.id, id))
          .limit(1)
      )[0] ?? null;

    await db
      .update(Changelog)
      .set({
        published: true,
        deleted: false,
        publishedAt: current?.publishedAt ?? new Date(),
        adminManaged: true,
      })
      .where(eq(Changelog.id, id));

    Sentry.logger.info(Sentry.logger.fmt`Changelog published: ${id}`, {
      "changelog.action": "publish",
      "changelog.id": id,
      // Distinguishes a first-time publish from re-publishing an entry that
      // already had a publish date — useful when auditing visibility changes.
      "changelog.republished": current?.publishedAt != null,
    });
  } catch (error) {
    Sentry.logger.error("Failed to publish changelog", {
      "changelog.action": "publish",
      "changelog.id": id,
      "error.message": (error as Error).message,
    });
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
  const session = await requireSession("create");
  if (!session) {
    return unauthorizedPayload;
  }
  const categoryNames = uniqueCategoryNames(getFormCategoryNames(formData));

  if (categoryNames.length > 0) {
    await db
      .insert(Category)
      .values(categoryNames.map((name) => ({ name })))
      .onConflictDoNothing({ target: Category.name });
  }

  if (session.user?.email == null) {
    throw new Error("Invariant: Users must have emails");
  }

  const user =
    (
      await db
        .select({ id: User.id })
        .from(User)
        .where(eq(User.email, session.user.email))
        .limit(1)
    )[0] ?? null;

  const slug = formData.get("slug") as string;
  const platforms = parsePlatforms(formData);

  const [changelog] = await db
    .insert(Changelog)
    .values({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      summary: formData.get("summary") as string,
      image: formData.get("image") as string,
      slug,
      platform: platforms,
      // Created in the UI, so the UI owns it; the file sync will never touch it.
      adminManaged: true,
      // Explicitly null so publishChangelog can distinguish a never-published
      // draft (null) from a re-publish of a previously-published entry (Date).
      // Without this, the schema @default(now()) fills publishedAt at creation
      // time and publishChangelog would incorrectly use that stale timestamp.
      publishedAt: null,
      authorId: user?.id ?? null,
      published: false,
      deleted: false,
    })
    .returning({ id: Changelog.id, title: Changelog.title });

  await syncChangelogCategories(changelog.id, categoryNames);

  // Audit event: who (opaque author id, not email), what (the new entry and
  // its shape), when (added automatically). Each count is its own scalar field
  // so you can chart, e.g., a spike in entries created with zero categories.
  Sentry.logger.info(Sentry.logger.fmt`Changelog created: ${changelog.id}`, {
    "changelog.action": "create",
    "changelog.id": changelog.id,
    "changelog.slug": slug,
    "changelog.platforms": platforms.length,
    "changelog.categories": categoryNames.length,
    "changelog.author_id": user?.id ?? null,
  });

  return redirect("/changelog/_admin");
}

export async function editChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await requireSession("edit");
  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;
  const categoryNames = uniqueCategoryNames(getFormCategoryNames(formData));

  if (categoryNames.length > 0) {
    await db
      .insert(Category)
      .values(categoryNames.map((name) => ({ name })))
      .onConflictDoNothing({ target: Category.name });
  }

  try {
    await db
      .update(Changelog)
      .set({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        summary: formData.get("summary") as string,
        image: formData.get("image") as string,
        slug: formData.get("slug") as string,
        platform: parsePlatforms(formData),
        // Edited in the UI, so the UI now owns it; future file syncs skip it.
        adminManaged: true,
      })
      .where(eq(Changelog.id, id));

    await syncChangelogCategories(id, categoryNames);
  } catch (error: any) {
    Sentry.logger.error("Failed to edit changelog", {
      "changelog.action": "edit",
      "changelog.id": id,
      "error.message": (error as Error).message,
    });
    return { message: (error as Error).message, success: false };
  }

  Sentry.logger.info(Sentry.logger.fmt`Changelog edited: ${id}`, {
    "changelog.action": "edit",
    "changelog.id": id,
    "changelog.categories": categoryNames.length,
  });

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  return redirect("/changelog/_admin");
}

export async function deleteChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await requireSession("delete");
  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;
  try {
    // Soft delete: mark deleted + admin-managed instead of removing the row,
    // so the file sync skips it and never re-creates the entry from its file.
    // Do NOT clear publishedAt — preserving it means a restored entry keeps
    // its original chronological position in the sorted list.
    await db
      .update(Changelog)
      .set({
        deleted: true,
        published: false,
        adminManaged: true,
      })
      .where(eq(Changelog.id, id));
  } catch (error) {
    Sentry.logger.error("Failed to delete changelog", {
      "changelog.action": "delete",
      "changelog.id": id,
      "error.message": (error as Error).message,
    });
    return { message: "Unable to delete changelog", success: false };
  }

  Sentry.logger.info(Sentry.logger.fmt`Changelog deleted: ${id}`, {
    "changelog.action": "delete",
    "changelog.id": id,
    // Soft delete — the row is retained and can be restored, so this is a
    // visibility change rather than a destructive removal.
    "changelog.soft_delete": true,
  });

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
  return {
    success: true,
  };
}
