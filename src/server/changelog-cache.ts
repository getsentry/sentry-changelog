import { createHash } from "node:crypto";

export function changelogTag(slug: string): string {
  const tag = `changelog:${slug}`;
  // Slugs can be 255 characters; Next cache tags are limited to 256.
  return tag.length <= 256
    ? tag
    : `changelog:${createHash("sha256").update(slug).digest("hex")}`;
}
