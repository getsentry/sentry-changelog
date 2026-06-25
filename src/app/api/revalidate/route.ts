import * as Sentry from "@sentry/nextjs";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

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
    // Forensic security event: a request hit the out-of-band revalidation hook
    // without the shared secret. `secret_configured` separates a real rejected
    // caller from the hook simply being misconfigured (env var missing).
    Sentry.logger.warn(
      "Rejected changelog cache revalidation: invalid secret",
      {
        "revalidate.authorized": false,
        "revalidate.secret_configured": Boolean(secret),
      },
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  for (const tag of TAGS) {
    revalidateTag(tag, "max");
  }

  Sentry.logger.info("Changelog caches revalidated out-of-band", {
    "revalidate.tags": TAGS.join(","),
  });

  return NextResponse.json({ revalidated: true, tags: TAGS });
}
