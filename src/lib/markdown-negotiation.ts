import { isAiAgent } from "./agent-detection";

// A Markdown response depends on these request headers. sentry.io's nginx
// cache honours Vary, so this keeps a cached Markdown copy from being served to
// a browser. The HTML of these pages can't carry it: Vercel serves them
// prerendered and replaces any Vary we set with Next.js's own.
export const MARKDOWN_VARY = "Accept, User-Agent";

// The Markdown route for a changelog page, or null when the page has no
// Markdown version. Paths keep their trailing slash (trailingSlash: true).
//   /changelog/        -> /api/changelog/markdown/
//   /changelog/<slug>/ -> /api/changelog/<slug>/markdown/
// Admin pages (/changelog/_admin/...) and deeper paths have none.
export function markdownRouteFor(pathname: string): string | null {
  if (pathname === "/changelog/" || pathname === "/changelog") {
    return "/api/changelog/markdown/";
  }
  const slug = /^\/changelog\/([^/]+)\/?$/.exec(pathname)?.[1];
  if (!slug || slug.startsWith("_")) return null;
  return `/api/changelog/${slug}/markdown/`;
}

// Media ranges from an Accept header, mapped to their quality (q) value.
function parseAccept(header: string): Map<string, number> {
  const ranges = new Map<string, number>();
  for (const part of header.split(",")) {
    const [range, ...params] = part.split(";").map((s) => s.trim());
    if (!range) continue;
    const qParam = params.find((p) => p.toLowerCase().startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    ranges.set(range.toLowerCase(), Number.isNaN(q) ? 0 : q);
  }
  return ranges;
}

// Serve Markdown when the client ranks text/markdown at or above text/html.
// A client that doesn't mention text/markdown at all has stated no preference
// for it: AI agents get Markdown, everyone else gets HTML. AI fetchers such as
// ChatGPT-User send a browser-style Accept, so a wildcard or text/html in it
// doesn't count as asking for HTML.
export function prefersMarkdown(
  accept: string | null,
  userAgent: string | null,
): boolean {
  const ranges = parseAccept(accept ?? "");
  const markdown = ranges.get("text/markdown");
  if (markdown === undefined) return isAiAgent(userAgent);
  const html =
    ranges.get("text/html") ?? ranges.get("text/*") ?? ranges.get("*/*") ?? 0;
  return markdown > 0 && markdown >= html;
}
