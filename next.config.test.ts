import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs/config", () => ({
  withSentryConfig: (config: unknown) => config,
}));

const { default: nextConfig } = await import("./next.config.mjs");

async function redirectFor(url: string, cookies?: Record<string, string>) {
  const response = await unstable_getResponseFromNextConfig({
    url,
    nextConfig,
    cookies,
  });
  return response.status === 200 ? null : getRedirectUrl(response);
}

describe("changelog.sentry.dev redirects", () => {
  it.each([
    ["https://changelog.sentry.dev/", "https://sentry.io/changelog/"],
    ["https://changelog.sentry.dev/changelog/", "https://sentry.io/changelog/"],
    [
      "https://changelog.sentry.dev/changelog/custom-inbound-filters/",
      "https://sentry.io/changelog/custom-inbound-filters/",
    ],
    [
      "https://changelog.sentry.dev/changelog/feed.xml",
      "https://sentry.io/changelog/feed.xml",
    ],
  ])("sends direct visits to %s to sentry.io", async (url, destination) => {
    expect(await redirectFor(url)).toBe(destination);
  });

  it.each([
    "https://changelog.sentry.dev/changelog/_admin/",
    "https://changelog.sentry.dev/api/changelogs/",
    "https://changelog.sentry.dev/api/auth/session/",
    "https://changelog.sentry.dev/fonts/rubik-latin-regular.woff2",
    "https://changelog.sentry.dev/_next/static/chunks/main.js",
  ])("keeps %s on changelog.sentry.dev", async (url) => {
    expect(await redirectFor(url)).toBeNull();
  });

  it("does not redirect the host sentry.io proxies to", async () => {
    expect(
      await redirectFor("https://sentry-changelog.sentry.dev/changelog/"),
    ).toBeNull();
  });

  it.each([
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.session-token.0",
  ])("keeps admins signed in with %s on changelog.sentry.dev", async (cookie) => {
    const cookies = { [cookie]: "token" };
    expect(
      await redirectFor(
        "https://changelog.sentry.dev/changelog/unpublished-draft/",
        cookies,
      ),
    ).toBeNull();
    expect(await redirectFor("https://changelog.sentry.dev/", cookies)).toBe(
      "https://changelog.sentry.dev/changelog",
    );
  });
});
