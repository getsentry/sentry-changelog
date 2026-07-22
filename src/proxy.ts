import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";

// best effort bot detection here
const BOT_UA_REGEX =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp|telegrambot|discordbot|preview|scan|monitor|headless|curl|wget|python-requests|axios|go-http-client/i;

function isBot(userAgent: string | null): boolean {
  if (!userAgent) {
    return true;
  }
  return BOT_UA_REGEX.test(userAgent);
}

export function proxy(request: NextRequest) {
  Sentry.metrics.count("page_visit", 1, {
    attributes: {
      path: request.nextUrl.pathname,
      bot: isBot(request.headers.get("user-agent")),
    },
  });

  return NextResponse.next();
}

// Only count visits to real pages — skip Next.js internals, API routes and
// static assets so the metric reflects actual visitors.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
