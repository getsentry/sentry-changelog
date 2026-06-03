#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import { loadChangelogFiles, resolveDate, validateEntries } from "./lib.mjs";

const prisma = new PrismaClient();

/**
 * Upserts every file in content/changelog/ into the Changelog table, keyed by
 * slug. Only slugs that exist as files are touched — posts created solely
 * through the admin UI are never modified or deleted by this script.
 */
async function syncEntry(entry) {
  const { slug, frontmatter, content } = entry;

  const categoryNames = Array.isArray(frontmatter.categories)
    ? frontmatter.categories
    : [];

  if (categoryNames.length > 0) {
    await prisma.category.createMany({
      data: categoryNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const connect = categoryNames.map((name) => ({ name }));

  // Resolve the author by email if provided.
  let authorConnect;
  if (typeof frontmatter.author === "string") {
    const user = await prisma.user.findUnique({
      where: { email: frontmatter.author },
    });
    if (user) {
      authorConnect = { connect: { id: user.id } };
    } else {
      console.warn(
        `  ! ${entry.filename}: author "${frontmatter.author}" not found; leaving author unset`,
      );
    }
  }

  const published = frontmatter.published === true;
  const deleted = frontmatter.deleted === true;
  const explicitDate = resolveDate(frontmatter);

  const existing = await prisma.changelog.findUnique({
    where: { slug },
    select: { publishedAt: true },
  });

  // publishedAt resolution:
  //  - explicit frontmatter date always wins
  //  - otherwise keep the existing value if present
  //  - otherwise, for a newly published post, stamp now
  let publishedAt = explicitDate ?? existing?.publishedAt ?? null;
  if (published && !publishedAt) {
    publishedAt = new Date();
  }
  if (!published) {
    publishedAt = explicitDate ?? null;
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

  await prisma.changelog.upsert({
    where: { slug },
    update: {
      ...common,
      ...(authorConnect && { author: authorConnect }),
    },
    create: {
      slug,
      ...common,
      categories: { connect },
      ...(authorConnect && { author: authorConnect }),
    },
  });

  return { slug, published, deleted };
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
  for (const entry of entries) {
    const result = await syncEntry(entry);
    const state = result.deleted
      ? "deleted"
      : result.published
        ? "published"
        : "draft";
    console.log(`  ✓ ${result.slug} (${state})`);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
