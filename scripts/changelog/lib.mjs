import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "js-yaml";

export const CONTENT_DIR = path.join(process.cwd(), "content", "changelog");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Split a raw markdown file into its YAML frontmatter and body.
 * Returns { frontmatter, body } where frontmatter is a parsed object.
 */
export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: null, body: raw.trim() };
  }
  const frontmatter = load(match[1]) ?? {};
  if (typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
    throw new Error("Frontmatter must be a YAML mapping");
  }
  return { frontmatter, body: (match[2] ?? "").trim() };
}

/** Files starting with "_" or "." (and README) are templates/docs and ignored. */
function isContentFile(name) {
  return (
    (name.endsWith(".md") || name.endsWith(".mdx")) &&
    !name.startsWith("_") &&
    !name.startsWith(".") &&
    name.toLowerCase() !== "readme.md"
  );
}

/**
 * Load and parse every changelog file in CONTENT_DIR.
 * Returns an array of { filename, slug, frontmatter, content }.
 * Does NOT validate — call validateEntries for that.
 */
export async function loadChangelogFiles(dir = CONTENT_DIR) {
  let names;
  try {
    names = await readdir(dir);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = names.filter(isContentFile).sort();
  const entries = [];

  for (const filename of files) {
    const raw = await readFile(path.join(dir, filename), "utf8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const fallbackSlug = filename.replace(/\.(md|mdx)$/, "");
    entries.push({
      filename,
      slug: frontmatter?.slug ?? fallbackSlug,
      frontmatter: frontmatter ?? {},
      content: body,
    });
  }

  return entries;
}

/**
 * Validate parsed entries. Returns an array of error strings (empty == valid).
 */
export function validateEntries(entries) {
  const errors = [];
  const seenSlugs = new Map();

  for (const entry of entries) {
    const { filename, slug, frontmatter, content } = entry;
    const prefix = `${filename}:`;

    if (!frontmatter || Object.keys(frontmatter).length === 0) {
      errors.push(`${prefix} missing YAML frontmatter block`);
      continue;
    }

    if (
      typeof frontmatter.title !== "string" ||
      frontmatter.title.trim() === ""
    ) {
      errors.push(
        `${prefix} "title" is required and must be a non-empty string`,
      );
    } else if (frontmatter.title.length > 255) {
      // Mirrors the VarChar(255) column limit so overflows fail validation
      // rather than blowing up mid-sync.
      errors.push(`${prefix} "title" must be 255 characters or fewer`);
    }

    // Guard the type first: YAML can parse `slug: 123` as a number, which
    // RegExp.test would silently coerce, and which dedup would mis-key.
    if (typeof slug !== "string") {
      errors.push(`${prefix} "slug" must be a string`);
    } else {
      if (!SLUG_RE.test(slug)) {
        errors.push(
          `${prefix} slug "${slug}" must be kebab-case (lowercase letters, digits, hyphens)`,
        );
      } else if (slug.length > 255) {
        errors.push(`${prefix} slug "${slug}" must be 255 characters or fewer`);
      }
      if (seenSlugs.has(slug)) {
        errors.push(
          `${prefix} duplicate slug "${slug}" (also used in ${seenSlugs.get(slug)})`,
        );
      } else {
        seenSlugs.set(slug, filename);
      }
    }

    if (
      frontmatter.summary !== undefined &&
      typeof frontmatter.summary !== "string"
    ) {
      errors.push(`${prefix} "summary" must be a string`);
    }

    if (
      frontmatter.image !== undefined &&
      typeof frontmatter.image !== "string"
    ) {
      errors.push(`${prefix} "image" must be a string`);
    }

    if (frontmatter.categories !== undefined) {
      if (
        !Array.isArray(frontmatter.categories) ||
        frontmatter.categories.some((c) => typeof c !== "string")
      ) {
        errors.push(`${prefix} "categories" must be a list of strings`);
      } else if (frontmatter.categories.some((c) => c.length > 255)) {
        // Mirrors the Category.name VarChar(255) limit so an overflow fails
        // validation rather than rolling back the whole sync transaction.
        errors.push(`${prefix} each category must be 255 characters or fewer`);
      }
    }

    if (
      frontmatter.published !== undefined &&
      typeof frontmatter.published !== "boolean"
    ) {
      errors.push(`${prefix} "published" must be a boolean`);
    }

    if (
      frontmatter.deleted !== undefined &&
      typeof frontmatter.deleted !== "boolean"
    ) {
      errors.push(`${prefix} "deleted" must be a boolean`);
    }

    const dateValue = frontmatter.date ?? frontmatter.publishedAt;
    if (
      dateValue !== undefined &&
      Number.isNaN(Date.parse(String(dateValue)))
    ) {
      errors.push(
        `${prefix} "date" (${dateValue}) is not a valid date (use YYYY-MM-DD)`,
      );
    }

    if (
      frontmatter.author !== undefined &&
      typeof frontmatter.author !== "string"
    ) {
      errors.push(`${prefix} "author" must be an email string`);
    }

    if (frontmatter.broadcastCategory !== undefined) {
      const validCategories = ["announcement", "feature", "sdk_update"];
      if (
        typeof frontmatter.broadcastCategory !== "string" ||
        !validCategories.includes(frontmatter.broadcastCategory)
      ) {
        errors.push(
          `${prefix} "broadcastCategory" must be one of: ${validCategories.join(", ")}`,
        );
      }
    }

    if (frontmatter.platform !== undefined) {
      if (
        !Array.isArray(frontmatter.platform) ||
        frontmatter.platform.some((p) => typeof p !== "string")
      ) {
        errors.push(
          `${prefix} "platform" must be a list of platform slug strings`,
        );
      } else if (frontmatter.platform.some((p) => p.length > 255)) {
        errors.push(
          `${prefix} each platform slug must be 255 characters or fewer`,
        );
      }
    }

    if (!frontmatter.deleted && content.trim() === "") {
      errors.push(`${prefix} body content is empty`);
    }
  }

  return errors;
}

/** Normalize a parsed entry's frontmatter date to a Date or null. */
export function resolveDate(frontmatter) {
  const value = frontmatter.date ?? frontmatter.publishedAt;
  if (value === undefined || value === null) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
