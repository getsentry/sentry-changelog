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

const VALID_BROADCAST_CATEGORIES = new Set([
  "announcement",
  "feature",
  "sdk_update",
]);

function parseBroadcastCategory(formData: FormData): string | null {
  const raw = formData.get("broadcastCategory");
  if (typeof raw === "string" && VALID_BROADCAST_CATEGORIES.has(raw)) {
    return raw;
  }
  return null;
}

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
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedPayload;
  }
  Sentry.setUser({ id: session.user?.id });
  const id = formData.get("id") as string;

  try {
    await db
      .update(Changelog)
      .set({ published: false, adminManaged: true })
      .where(eq(Changelog.id, id));
  } catch (error) {
    Sentry.logger.error("Changelog unpublish failed", {
      "changelog.id": id,
      "changelog.action": "unpublish",
      "error.message": error instanceof Error ? error.message : String(error),
    });
    return { message: "Unable to unpublish changelog", success: false };
  }

  // Audit: a previously public entry was hidden from the changelog.
  Sentry.logger.info("Changelog unpublished", {
    "changelog.id": id,
    "changelog.action": "unpublish",
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
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedPayload;
  }
  Sentry.setUser({ id: session.user?.id });
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
  } catch (error) {
    Sentry.logger.error("Changelog publish failed", {
      "changelog.id": id,
      "changelog.action": "publish",
      "error.message": error instanceof Error ? error.message : String(error),
    });
    return { message: "Unable to publish changelog", success: false };
  }

  // Audit: an entry became publicly visible on the changelog.
  Sentry.logger.info("Changelog published", {
    "changelog.id": id,
    "changelog.action": "publish",
  });

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
  Sentry.setUser({ id: session.user?.id });
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

  const [changelog] = await db
    .insert(Changelog)
    .values({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      summary: formData.get("summary") as string,
      image: formData.get("image") as string,
      slug: formData.get("slug") as string,
      platform: parsePlatforms(formData),
      broadcastCategory: parseBroadcastCategory(formData),
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

  // Audit: a new entry was authored through the admin UI (always a draft;
  // platform/category counts show how the entry was targeted at creation).
  Sentry.logger.info("Changelog created", {
    "changelog.id": changelog.id,
    "changelog.slug": formData.get("slug") as string,
    "changelog.action": "create",
    "changelog.platform_count": parsePlatforms(formData).length,
    "changelog.category_count": categoryNames.length,
  });

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
  Sentry.setUser({ id: session.user?.id });
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
        // A sentinel hidden input (broadcastCategoryPresent) is always submitted
        // by the edit form, even when react-select removes its own hidden input
        // after the user clears the dropdown. This distinguishes "field was
        // rendered but cleared" (write null) from "field was never on the page"
        // (preserve existing value).
        ...(formData.has("broadcastCategoryPresent")
          ? { broadcastCategory: parseBroadcastCategory(formData) }
          : {}),
        // Edited in the UI, so the UI now owns it; future file syncs skip it.
        adminManaged: true,
      })
      .where(eq(Changelog.id, id));

    await syncChangelogCategories(id, categoryNames);
  } catch (error: any) {
    Sentry.logger.error("Changelog edit failed", {
      "changelog.id": id,
      "changelog.action": "edit",
      "error.message": error instanceof Error ? error.message : String(error),
    });
    return { message: (error as Error).message, success: false };
  }

  // Audit: an existing entry's content or targeting was changed via the admin
  // UI, which also marks it admin-managed so the file sync no longer touches it.
  Sentry.logger.info("Changelog updated", {
    "changelog.id": id,
    "changelog.slug": formData.get("slug") as string,
    "changelog.action": "edit",
    "changelog.platform_count": parsePlatforms(formData).length,
    "changelog.category_count": categoryNames.length,
  });

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
  Sentry.setUser({ id: session.user?.id });
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
    Sentry.logger.error("Changelog delete failed", {
      "changelog.id": id,
      "changelog.action": "delete",
      "error.message": error instanceof Error ? error.message : String(error),
    });
    return { message: "Unable to delete changelog", success: false };
  }

  // Audit: an entry was soft-deleted (hidden, but the row is retained).
  Sentry.logger.info("Changelog deleted", {
    "changelog.id": id,
    "changelog.action": "delete",
  });

  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
  return {
    success: true,
  };
}
