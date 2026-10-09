"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
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

function revalidateChangelogs() {
  revalidateTag("changelogs", "max");
  revalidateTag("changelog-detail", "max");
  revalidatePath("/changelog/_admin");
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

type ChangelogFields = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string | null;
};

function parseChangelogFields(
  formData: FormData,
):
  | { ok: true; fields: ChangelogFields }
  | { ok: false; error: ServerActionPayloadInterface } {
  const fields = {
    title: formString(formData, "title"),
    slug: formString(formData, "slug"),
    summary: formString(formData, "summary"),
    content: formString(formData, "content"),
    image: formString(formData, "image") || null,
  };

  const fieldErrors: Record<string, string> = {};
  if (!fields.title) fieldErrors.title = "Title is required";
  if (!fields.slug) {
    fieldErrors.slug = "Slug is required";
  } else if (!/^[^\s/?#]+$/.test(fields.slug)) {
    // Kept permissive on purpose: legacy slugs predate the client-side
    // slugify, so only reject characters that would break the URL.
    fieldErrors.slug = "Slugs can't contain spaces, slashes, ? or #";
  }
  if (!fields.summary) fieldErrors.summary = "Summary is required";
  if (!fields.content) fieldErrors.content = "Body is required";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        success: false,
        message: "Please fix the highlighted fields",
        fieldErrors,
      },
    };
  }
  return { ok: true, fields };
}

// Postgres unique_violation on the slug index.
function isSlugConflict(error: unknown): boolean {
  const err = error as { code?: string; constraint?: string; cause?: unknown };
  if (err?.code === "23505") return true;
  return err?.cause ? isSlugConflict(err.cause) : false;
}

const slugConflictPayload: ServerActionPayloadInterface = {
  success: false,
  message: "Another post already uses this slug",
  fieldErrors: { slug: "This slug is already taken" },
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
  const id = formData.get("id") as string;

  try {
    await db
      .update(Changelog)
      .set({ published: false, adminManaged: true })
      .where(eq(Changelog.id, id));
  } catch (error) {
    console.error("UNPUBLISH ACTION ERROR:", error);
    return { message: "Unable to unpublish changelog", success: false };
  }

  revalidateChangelogs();
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
    console.error("PUBLISH ACTION ERROR:", error);
    return { message: "Unable to publish changelog", success: false };
  }

  revalidateChangelogs();
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
  if (session.user?.email == null) {
    throw new Error("Invariant: Users must have emails");
  }

  const parsed = parseChangelogFields(formData);
  if (!parsed.ok) {
    return parsed.error;
  }
  const { fields } = parsed;
  const categoryNames = uniqueCategoryNames(getFormCategoryNames(formData));

  try {
    if (categoryNames.length > 0) {
      await db
        .insert(Category)
        .values(categoryNames.map((name) => ({ name })))
        .onConflictDoNothing({ target: Category.name });
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
        ...fields,
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

    revalidatePath("/changelog/_admin");
    return { success: true, id: changelog.id };
  } catch (error) {
    if (isSlugConflict(error)) {
      return slugConflictPayload;
    }
    console.error("CREATE ACTION ERROR:", error);
    return { success: false, message: "Unable to create changelog" };
  }
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
  const parsed = parseChangelogFields(formData);
  if (!parsed.ok) {
    return parsed.error;
  }
  const { fields } = parsed;
  const categoryNames = uniqueCategoryNames(getFormCategoryNames(formData));

  try {
    if (categoryNames.length > 0) {
      await db
        .insert(Category)
        .values(categoryNames.map((name) => ({ name })))
        .onConflictDoNothing({ target: Category.name });
    }

    await db
      .update(Changelog)
      .set({
        ...fields,
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
  } catch (error) {
    if (isSlugConflict(error)) {
      return slugConflictPayload;
    }
    console.error("EDIT ACTION ERROR:", error);
    return { message: "Unable to save changelog", success: false };
  }

  revalidateChangelogs();
  return { success: true, id };
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
    await db
      .update(Changelog)
      .set({
        deleted: true,
        published: false,
        adminManaged: true,
      })
      .where(eq(Changelog.id, id));
  } catch (error) {
    console.error("DELETE ACTION ERROR:", error);
    return { message: "Unable to delete changelog", success: false };
  }

  revalidateChangelogs();
  return { success: true };
}

export async function restoreChangelog(
  _currentState: ServerActionPayloadInterface,
  formData: FormData,
): Promise<ServerActionPayloadInterface> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedPayload;
  }
  const id = formData.get("id") as string;
  try {
    // Bring a soft-deleted entry back as a draft; publishing stays explicit.
    await db
      .update(Changelog)
      .set({ deleted: false, published: false, adminManaged: true })
      .where(eq(Changelog.id, id));
  } catch (error) {
    console.error("RESTORE ACTION ERROR:", error);
    return { message: "Unable to restore changelog", success: false };
  }

  revalidateChangelogs();
  return { success: true };
}
