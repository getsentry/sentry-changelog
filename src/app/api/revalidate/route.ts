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
    // Security-relevant: the only legitimate caller is the out-of-band sync
    // job. Distinguish a misconfigured server from a bad/forged secret without
    // ever logging the provided value.
    Sentry.logger.warn("Revalidation request rejected", {
      "api.endpoint": "revalidate",
      "api.reject_reason": secret ? "invalid_secret" : "secret_not_configured",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  for (const tag of TAGS) {
    revalidateTag(tag, "max");
  }

  // Operational: confirms the sync job's post-commit cache bust reached the app.
  Sentry.logger.info("Site cache revalidated", {
    "api.endpoint": "revalidate",
    "revalidate.tags": TAGS.join(","),
  });

  return NextResponse.json({ revalidated: true, tags: TAGS });
}
