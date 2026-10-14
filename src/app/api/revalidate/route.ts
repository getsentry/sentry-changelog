import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { changelogTag } from "@/server/changelog-cache";

const FEED_TAGS = ["changelogs", "changelog-recent"];

/**
 * Out-of-band cache revalidation hook. The changelog sync job (a GitHub
 * Action) writes directly to the database, so it cannot call revalidateTag
 * the way the in-process admin server actions do. After syncing it POSTs
 * here with the shared secret to bust the same cache tags.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Older callers can still request a full refresh with an empty body.
  const body = await request.text();
  let slugs: string[] | null = null;
  if (body) {
    try {
      const payload = JSON.parse(body);
      if (
        !Array.isArray(payload.slugs) ||
        payload.slugs.length > 1000 ||
        payload.slugs.some(
          (slug: unknown) =>
            typeof slug !== "string" ||
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
            slug.length > 255,
        )
      ) {
        throw new Error("Invalid slugs");
      }
      slugs = [...new Set<string>(payload.slugs)];
    } catch {
      return NextResponse.json({ error: "Invalid slugs" }, { status: 400 });
    }
  }
  const tags = [
    ...FEED_TAGS,
    ...(slugs ? slugs.map((slug) => changelogTag(slug)) : ["changelog-detail"]),
  ];
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
  if (slugs) {
    revalidatePath("/changelog", "page");
    for (const slug of slugs) revalidatePath(`/changelog/${slug}`);
  } else {
    revalidatePath("/changelog", "layout");
  }

  return NextResponse.json({ revalidated: true, tags });
}
