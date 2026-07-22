import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse, userAgent } from "next/server";

// Reduce a Referer URL to just its hostname so it stays low-cardinality
// ("github.com", "google.com", …). Same-origin and empty referers count as
// "direct" traffic.
function referrerSource(request: NextRequest): string {
  const referer = request.headers.get("referer");
  if (!referer) return "direct";
  try {
    const host = new URL(referer).hostname;
    return host === request.nextUrl.hostname ? "direct" : host;
  } catch {
    return "unknown";
  }
}

export function proxy(request: NextRequest) {
  const { isBot, browser, device, os, engine } = userAgent(request);

  // Metric attributes must be primitives; drop any field we couldn't resolve
  // so we don't emit empty values.
  const attributes: Record<string, string | boolean> = {
    path: request.nextUrl.pathname,
    method: request.method,
    bot: isBot,
    // device.type is undefined for desktop browsers.
    device: device.type ?? "desktop",
    referrer: referrerSource(request),
  };

  if (browser.name) attributes.browser = browser.name;
  if (os.name) attributes.os = os.name;
  if (engine.name) attributes.engine = engine.name;

  // First subtag of Accept-Language, e.g. "en-US,en;q=0.9" -> "en".
  const language = request.headers
    .get("accept-language")
    ?.split(",")[0]
    ?.split("-")[0]
    ?.trim();
  if (language) attributes.language = language;

  // Vercel injects geo headers at the edge on every request — no
  // @vercel/functions dependency needed. Country is low-cardinality; we skip
  // region/city to keep the metric manageable.
  const country = request.headers.get("x-vercel-ip-country");
  if (country) attributes.country = country;

  Sentry.metrics.count("page_visit", 1, { attributes });

  return NextResponse.next();
}

// Only count visits to real pages — skip Next.js internals, API routes and
// static assets so the metric reflects actual visitors.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
