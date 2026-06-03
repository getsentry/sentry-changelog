import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TAGS = ["changelogs", "changelog-detail"] as const;

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

  for (const tag of TAGS) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags: TAGS });
}
