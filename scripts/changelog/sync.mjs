#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import { loadChangelogFiles, resolveDate, validateEntries } from "./lib.mjs";

const prisma = new PrismaClient();

/**
 * Upserts every file in content/changelog/ into the Changelog table, keyed by
 * slug. Only slugs that exist as files are touched — posts created solely
 * through the admin UI are never modified or deleted by this script.
 *
 * Receives a Prisma transaction client (`tx`) so the whole run is atomic: if
 * any entry fails, every upsert in the run is rolled back.
 */
async function syncEntry(tx, entry) {
  const { slug, frontmatter, content } = entry;

  const categoryNames = Array.isArray(frontmatter.categories)
    ? frontmatter.categories
    : [];

  if (categoryNames.length > 0) {
    await tx.category.createMany({
      data: categoryNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const connect = categoryNames.map((name) => ({ name }));

  // Resolve the author by email.
  //  - email present + user found  -> connect
  //  - email present + user missing -> leave unchanged (warn)
  //  - no email in frontmatter      -> clear any existing author on update
  let authorUpdate;
  let authorCreate;
  const authorEmail =
    typeof frontmatter.author === "string" ? frontmatter.author.trim() : "";
  if (authorEmail) {
    const user = await tx.user.findUnique({ where: { email: authorEmail } });
    if (user) {
      authorUpdate = { connect: { id: user.id } };
      authorCreate = { connect: { id: user.id } };
    } else {
      console.warn(
        `  ! ${entry.filename}: author "${authorEmail}" not found; leaving author unchanged`,
      );
    }
  } else {
    authorUpdate = { disconnect: true };
  }

  const deleted = frontmatter.deleted === true;
  // A tombstoned entry is always unpublished, regardless of the published flag.
  const published = frontmatter.published === true && !deleted;
  const explicitDate = resolveDate(frontmatter);

  const existing = await tx.changelog.findUnique({
    where: { slug },
    select: { publishedAt: true },
  });

  // publishedAt resolution (applies whether published or not, so unpublishing
  // never discards an entry's original publication date):
  //  - explicit frontmatter date always wins
  //  - otherwise keep the existing value if present
  //  - otherwise, for a newly published post, stamp now
  let publishedAt = explicitDate ?? existing?.publishedAt ?? null;
  if (published && !publishedAt) {
    publishedAt = new Date();
  }

  const common = {
    title: frontmatter.title,
    content,
    summary:
      typeof frontmatter.summary === "string" ? frontmatter.summary : null,
    image: typeof frontmatter.image === "string" ? frontmatter.image : null,
    published,
    deleted,
    publishedAt,
    categories: { set: connect },
  };

  await tx.changelog.upsert({
    where: { slug },
    update: {
      ...common,
      ...(authorUpdate && { author: authorUpdate }),
    },
    create: {
      slug,
      ...common,
      categories: { connect },
      ...(authorCreate && { author: authorCreate }),
    },
  });

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
    // Don't fail the whole sync just because revalidation didn't go through;
    // the data is already committed and caches will expire on their own.
    console.warn(`  ! Cache revalidation failed: ${error.message}`);
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
  const results = await prisma.$transaction(
    async (tx) => {
      const out = [];
      for (const entry of entries) {
        out.push(await syncEntry(tx, entry));
      }
      return out;
    },
    { timeout: 60_000, maxWait: 10_000 },
  );

  // Only logged after the transaction has committed.
  for (const result of results) {
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
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
