import * as Sentry from "@sentry/nextjs";
import { after, type NextRequest, NextResponse, userAgent } from "next/server";
import { isAiAgent } from "@/lib/agent-detection";
import {
  MARKDOWN_VARY,
  markdownRouteFor,
  prefersMarkdown,
} from "@/lib/markdown-negotiation";
import { reportToProfound } from "@/lib/profound";

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

function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-segment-prefetch")
  );
}

export function proxy(request: NextRequest) {
  // The router prefetches every visible link, so one view of the feed would
  // otherwise count as a visit to each article on screen.
  if (isPrefetch(request)) return NextResponse.next();

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

  // Metrics are buffered by the SDK. Keep the request alive long enough to
  // flush them after the response has been sent.
  after(() => Sentry.flush(2000));

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent");
  if (isAiAgent(ua)) reportToProfound(request);

  const markdownRoute = markdownRouteFor(request.nextUrl);
  if (!markdownRoute || !prefersMarkdown(request.headers.get("accept"), ua)) {
    return NextResponse.next();
  }

  // Rewrite rather than redirect, so the agent keeps the page URL and gets the
  // Markdown in one request.
  const response = NextResponse.rewrite(new URL(markdownRoute, request.url));
  response.headers.set("Vary", MARKDOWN_VARY);
  return response;
}

// Only count visits to real pages — skip Next.js internals, API routes, the
// Sentry tunnel and any path with a dot (fonts, images, feed.xml, robots.txt).
// Page slugs are kebab-case, so no page path contains a dot.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|sentry-tunnel|.*\\..*).*)"],
};
