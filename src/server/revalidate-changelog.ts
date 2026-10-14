import { revalidatePath, updateTag } from "next/cache";
import { changelogTag } from "@/server/changelog-cache";

// Feed metadata and recent cards change together; article bodies have their own
// tags so editing one entry does not discard every compiled article.
export function invalidateChangelogs(slugs: string[]) {
  updateTag("changelogs");
  updateTag("changelog-recent");
  revalidatePath("/changelog", "page");
  for (const slug of new Set(slugs.filter(Boolean))) {
    updateTag(changelogTag(slug));
    revalidatePath(`/changelog/${encodeURIComponent(slug)}`);
  }
}
