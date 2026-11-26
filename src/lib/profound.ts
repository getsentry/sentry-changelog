import { after, type NextRequest } from "next/server";

// Profound Agent Analytics counts AI-bot visits. This project has no Profound
// log drain, so report each bot hit through Profound's Custom Log Integration:
// https://docs.tryprofound.com/agent-analytics/custom
// Mirrors reportToProfound() in getsentry/static-sites
// packages/www-astro/middleware.ts.
const PROFOUND_LOGS_URL = "https://artemis.api.tryprofound.com/v1/logs/custom";

// Field limits from the Profound API spec.
const MAX_HOST_LENGTH = 255;
const MAX_PATH_LENGTH = 2048;
const MAX_IP_LENGTH = 45;
const MAX_USER_AGENT_LENGTH = 1024;
const MAX_REFERER_LENGTH = 2048;
const MAX_QUERY_KEY_LENGTH = 100;
const MAX_QUERY_VALUE_LENGTH = 1000;

// The domain Profound tracks for sentry.io.
const SENTRY_IO_HOST = "sentry.io";

const clip = (value: string, max: number) => value.slice(0, max);

// sentry.io's nginx proxies /changelog/ here and sets X-Sentry-Connecting-IP to
// the visitor's address. Vercel's own client IP (x-real-ip, which is what
// ipAddress() from @vercel/functions reads) is nginx's address for those
// requests, so it is only the fallback for direct hits on changelog.sentry.dev.
function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-sentry-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    ""
  );
}

// nginx sends `Host: sentry-changelog.sentry.dev`, so the request URL never
// says sentry.io. A request that carries nginx's header came through sentry.io;
// anything else hit the Vercel domain directly.
function visitedHost(request: NextRequest): string {
  return request.headers.has("x-sentry-connecting-ip")
    ? SENTRY_IO_HOST
    : request.nextUrl.hostname;
}

function queryParams(url: URL): Record<string, string> | undefined {
  if (!url.search) return;
  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    params[clip(key, MAX_QUERY_KEY_LENGTH)] = clip(
      value,
      MAX_QUERY_VALUE_LENGTH,
    );
  }
  return params;
}

// Structured line so failures are searchable in Vercel's request logs.
function logProfoundFailure(details: Record<string, unknown>) {
  console.error(JSON.stringify({ event: "profound_log_failed", ...details }));
}

async function sendToProfound(token: string, entry: unknown) {
  try {
    const response = await fetch(PROFOUND_LOGS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": token },
      body: JSON.stringify([entry]),
    });
    // Profound answers 200 with an `errors` list when it rejects an entry.
    const body = (await response.json().catch(() => null)) as {
      errors?: unknown[];
    } | null;
    if (!response.ok || body?.errors?.length) {
      logProfoundFailure({ status: response.status, errors: body?.errors });
    }
  } catch (error) {
    logProfoundFailure({ error: String(error) });
  }
}

// Report one page hit to Profound after the response is sent, so the visitor
// never waits on it and a Profound failure never changes the response.
// Production only, so previews and local runs don't count as visits.
export function reportToProfound(request: NextRequest) {
  const token = process.env.PROFOUND_LOG_TOKEN;
  if (!token || process.env.VERCEL_ENV !== "production") return;

  const url = request.nextUrl;
  const query = queryParams(url);
  const referer = request.headers.get("referer");
  const entry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    host: clip(visitedHost(request), MAX_HOST_LENGTH),
    path: clip(url.pathname, MAX_PATH_LENGTH),
    // Proxy runs before the page renders, so the status isn't known yet.
    status_code: 200,
    ip: clip(clientIp(request), MAX_IP_LENGTH),
    user_agent: clip(
      request.headers.get("user-agent") ?? "",
      MAX_USER_AGENT_LENGTH,
    ),
    ...(query && { query_params: query }),
    ...(referer && { referer: clip(referer, MAX_REFERER_LENGTH) }),
  };

  after(() => sendToProfound(token, entry));
}
