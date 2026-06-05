#!/usr/bin/env node
import { eq, inArray, sql } from "drizzle-orm";
import { drizzle, type NodePgTransaction } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  _CategoryToChangelog,
  Category,
  Changelog,
  User,
} from "../../src/server/db/schema";
import { loadChangelogFiles, resolveDate, validateEntries } from "./lib.mjs";

const schema = {
  Category,
  Changelog,
  User,
  _CategoryToChangelog,
};

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  options: "-c statement_timeout=60000",
});

const db = drizzle(pool, { schema });

type ChangelogFileEntry = {
  filename: string;
  slug: string;
  frontmatter: {
    title: string;
    summary?: string | null;
    image?: string | null;
    deleted?: boolean;
    published?: boolean;
    categories?: string[];
    platform?: string[];
    author?: string;
  };
  content: string;
};

type LockedChangelogRow = {
  publishedAt: Date | null;
  adminManaged: boolean | null;
};

/**
 * Upserts every file in content/changelog/ into the Changelog table, keyed by
 * slug. Only slugs that exist as files are touched — posts created solely
 * through the admin UI are never modified or deleted by this script.
 *
 * Receives a Drizzle transaction client (`tx`) so the whole run is atomic: if
 * any entry fails, every upsert in the run is rolled back.
 */
async function syncEntry(
  tx: NodePgTransaction<any, any>,
  entry: ChangelogFileEntry,
): Promise<{
  slug: string;
  skipped?: boolean;
  published?: boolean;
  deleted?: boolean;
}> {
  const { slug, frontmatter, content } = entry;

  // Lock the row (if it exists) for the rest of the transaction with SELECT …
  // FOR UPDATE. This closes the read-then-write race: a concurrent admin save
  // either committed before this lock (so we read adminManaged=true and skip)
  // or blocks until this sync commits and then applies on top — so a UI edit
  // is never silently overwritten.
  const lockedRows = await tx.execute(sql`
    SELECT "publishedAt", "adminManaged"
    FROM "Changelog"
    WHERE "slug" = ${slug}
    FOR UPDATE
  `);
  const existing = lockedRows.rows[0] as LockedChangelogRow | undefined;

  // Once an entry has been touched in the admin UI it is owned by the UI;
  // never overwrite it from its file.
  if (existing?.adminManaged) {
    return { slug, skipped: true };
  }

  const categoryNames = Array.isArray(frontmatter.categories)
    ? frontmatter.categories
    : [];

  if (categoryNames.length > 0) {
    await tx
      .insert(Category)
      .values(categoryNames.map((name: string) => ({ name })))
      .onConflictDoNothing({ target: Category.name });
  }

  // Resolve the author by email.
  //  - email present + user found  -> connect
  //  - email present + user missing -> leave unchanged (warn)
  //  - no email in frontmatter      -> clear any existing author on update
  let authorId: string | undefined;
  let clearAuthorOnUpdate = false;
  const authorEmail =
    typeof frontmatter.author === "string" ? frontmatter.author.trim() : "";
  if (authorEmail) {
    const [user] = await tx
      .select({ id: User.id })
      .from(User)
      .where(eq(User.email, authorEmail))
      .limit(1);
    if (user) {
      authorId = user.id;
    } else {
      console.warn(
        `  ! ${entry.filename}: author "${authorEmail}" not found; leaving author unchanged`,
      );
    }
  } else {
    clearAuthorOnUpdate = true;
  }

  const deleted = frontmatter.deleted === true;
  // A tombstoned entry is always unpublished, regardless of the published flag.
  const published = frontmatter.published === true && !deleted;
  const explicitDate = resolveDate(frontmatter);

  // publishedAt resolution (applies whether published or not, so unpublishing
  // never discards an entry's original publication date):
  //  - explicit frontmatter date always wins
  //  - otherwise keep the existing value if present
  //  - otherwise, for a newly published post, stamp now
  let publishedAt = explicitDate ?? existing?.publishedAt ?? null;
  if (published && !publishedAt) {
    publishedAt = new Date();
  }

  const platformSlugs = Array.isArray(frontmatter.platform)
    ? frontmatter.platform.filter((p) => typeof p === "string")
    : [];

  const common = {
    title: frontmatter.title,
    content,
    summary:
      typeof frontmatter.summary === "string" ? frontmatter.summary : null,
    image: typeof frontmatter.image === "string" ? frontmatter.image : null,
    published,
    deleted,
    publishedAt,
    slug,
    platform: platformSlugs,
  };

  const [changelog] = await tx
    .insert(Changelog)
    .values({
      ...common,
      adminManaged: false,
      ...(authorId ? { authorId } : {}),
    })
    .onConflictDoUpdate({
      target: Changelog.slug,
      set: {
        ...common,
        ...(authorId
          ? { authorId }
          : clearAuthorOnUpdate
            ? { authorId: null }
            : {}),
      },
    })
    .returning({ id: Changelog.id });

  const changelogId = changelog.id;

  await tx
    .delete(_CategoryToChangelog)
    .where(eq(_CategoryToChangelog.B, changelogId));

  if (categoryNames.length > 0) {
    const categoryRows = await tx
      .select({ id: Category.id })
      .from(Category)
      .where(inArray(Category.name, categoryNames));

    if (categoryRows.length > 0) {
      await tx.insert(_CategoryToChangelog).values(
        categoryRows.map((row: { id: string }) => ({
          A: row.id,
          B: changelogId,
        })),
      );
    }
  }

  return { slug, published, deleted };
}

/**
 * After a successful sync, bust the Next.js cache tags so the public pages,
 * detail pages, and RSS feed reflect the change immediately. The sync runs
 * out-of-band (a GitHub Action), so it cannot call revalidateTag directly and
 * instead POSTs to the app's /api/revalidate hook. No-op (with a warning) when
 * the env vars are unset, e.g. local runs.
 */
async function revalidateSite() {
  const url = process.env.SITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) {
    console.warn(
      "  ! SITE_REVALIDATE_URL / REVALIDATE_SECRET not set — skipping cache revalidation",
    );
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    console.log("Revalidated site cache.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Don't fail the whole sync just because revalidation didn't go through;
    // the data is already committed and caches will expire on their own.
    console.warn(`  ! Cache revalidation failed: ${message}`);
  }
}

async function main() {
  const entries = await loadChangelogFiles();

  const errors = validateEntries(entries);
  if (errors.length > 0) {
    console.error("✗ Refusing to sync — validation failed:");
    for (const error of errors) console.error(`  • ${error}`);
    process.exit(1);
  }

  if (entries.length === 0) {
    console.log("No changelog files to sync.");
    return;
  }

  console.log(`Syncing ${entries.length} changelog file(s)…`);

  // All upserts run in one transaction: a failure on any entry rolls back the
  // entire run rather than leaving the database half-updated.
  const typedEntries = entries as ChangelogFileEntry[];
  const results = await db.transaction(async (tx) => {
    const out: Array<{
      slug: string;
      skipped?: boolean;
      published?: boolean;
      deleted?: boolean;
    }> = [];
    for (const entry of typedEntries) {
      out.push(await syncEntry(tx as NodePgTransaction<any, any>, entry));
    }
    return out;
  });

  // Only logged after the transaction has committed.
  for (const result of results) {
    if (result.skipped) {
      console.log(`  ↷ ${result.slug} (skipped — admin-managed)`);
      continue;
    }
    const state = result.deleted
      ? "deleted"
      : result.published
        ? "published"
        : "draft";
    console.log(`  ✓ ${result.slug} (${state})`);
  }
  console.log("Done.");

  await revalidateSite();
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(error);
    } else {
      console.error(`Unknown error: ${String(error)}`);
    }
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
