import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const count = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  metrics: { count: (...args: unknown[]) => count(...args) },
  flush: vi.fn(),
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn(),
}));

const { config, proxy } = await import("./proxy");

const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("proxy matcher", () => {
  it.each([
    "/",
    "/changelog/",
    "/changelog/javascript-sdk-v11/",
    "/changelog/_admin/",
  ])("runs on page %s", (url) => {
    expect(matches(url)).toBe(true);
  });

  it.each([
    "/fonts/rubik-latin-500.woff2",
    "/nav-icons/intro-demo.png",
    "/changelog/feed.xml",
    "/robots.txt",
    "/favicon.ico",
    "/sentry-tunnel",
    "/sentry-tunnel/?o=1&p=4507657212592128&r=us",
    "/api/changelogs",
    "/_next/static/chunks/main.js",
  ])("skips non-page %s", (url) => {
    expect(matches(url)).toBe(false);
  });
});

describe("proxy page_visit counter", () => {
  beforeEach(() => count.mockClear());

  it("counts a document request", () => {
    proxy(new NextRequest("https://changelog.sentry.dev/changelog/"));
    expect(count).toHaveBeenCalledTimes(1);
    expect(count.mock.calls[0][0]).toBe("page_visit");
    expect(count.mock.calls[0][2].attributes.path).toBe("/changelog/");
  });

  it("counts a client-side navigation", () => {
    proxy(
      new NextRequest(
        "https://changelog.sentry.dev/changelog/seer-agent-updates/",
        {
          headers: { rsc: "1" },
        },
      ),
    );
    expect(count).toHaveBeenCalledTimes(1);
  });

  it.each([
    "next-router-prefetch",
    "next-router-segment-prefetch",
  ])("does not count a %s request", (header) => {
    proxy(
      new NextRequest(
        "https://changelog.sentry.dev/changelog/seer-agent-updates/",
        {
          headers: { rsc: "1", [header]: "1" },
        },
      ),
    );
    expect(count).not.toHaveBeenCalled();
  });
});
