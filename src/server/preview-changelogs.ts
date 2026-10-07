import type { CategoryModel, ChangelogModel } from "@/server/db/schema";
import {
  loadChangelogFiles,
  resolveDate,
  validateEntries,
} from "../../scripts/changelog/lib.mjs";

export type ChangelogWithCategories = ChangelogModel & {
  categories: CategoryModel[];
};

type ChangelogFileEntry = {
  slug: string;
  frontmatter: {
    title: string;
    summary?: string;
    image?: string;
    published?: boolean;
    deleted?: boolean;
    categories?: string[];
    platform?: string[];
    broadcastCategory?: string;
  };
  content: string;
};

/** Overlay branch files without writing to the database, following sync ownership rules. */
export async function loadPreviewChangelogs(
  databaseEntries: ChangelogWithCategories[],
): Promise<ChangelogWithCategories[]> {
  const files = await loadChangelogFiles();
  const errors = validateEntries(files);
  if (errors.length > 0) {
    throw new Error(`Invalid preview changelog files:\n${errors.join("\n")}`);
  }

  const entries = new Map(databaseEntries.map((entry) => [entry.slug, entry]));
  const categories = new Map(
    databaseEntries.flatMap((entry) =>
      entry.categories.map((category) => [category.name, category] as const),
    ),
  );

  for (const { slug, frontmatter, content } of files as ChangelogFileEntry[]) {
    const existing = entries.get(slug);
    // Include unpublished/deleted DB rows so files cannot resurrect admin-owned entries.
    if (existing?.adminManaged) continue;

    const deleted = frontmatter.deleted === true;
    const published = frontmatter.published === true && !deleted;
    const now = new Date();
    const publishedAt =
      resolveDate(frontmatter) ??
      existing?.publishedAt ??
      (published ? now : null);

    entries.set(slug, {
      id: existing?.id ?? `preview:${slug}`,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      title: frontmatter.title,
      slug,
      image: frontmatter.image ?? null,
      content,
      summary: frontmatter.summary ?? null,
      published,
      deleted,
      adminManaged: false,
      publishedAt,
      platform: frontmatter.platform ?? [],
      broadcastCategory: frontmatter.broadcastCategory ?? null,
      authorId: existing?.authorId ?? null,
      categories: [...new Set(frontmatter.categories ?? [])].map((name) => {
        const category = categories.get(name) ?? {
          id: `preview-category:${name}`,
          name,
          deleted: false,
        };
        categories.set(name, category);
        return category;
      }),
    });
  }

  return [...entries.values()].sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );
}
