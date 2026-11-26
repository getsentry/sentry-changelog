import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const count = vi.fn();
const { after } = vi.hoisted(() => ({ after: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({
  metrics: { count: (...args: unknown[]) => count(...args) },
  flush: vi.fn(),
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after,
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

const BOT_UA =
  "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot";
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
// Chrome's Accept for a page load. ChatGPT-User sends the same.
const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8";

// A request as sentry.io's nginx forwards it to this app.
function viaSentryIo(path: string, headers: Record<string, string>) {
  return new NextRequest(`https://sentry-changelog.sentry.dev${path}`, {
    headers: { "x-sentry-connecting-ip": "203.0.113.7", ...headers },
  });
}

const rewrittenTo = (response: Response) => {
  const target = response.headers.get("x-middleware-rewrite");
  return target ? new URL(target).pathname : null;
};

describe("proxy Markdown negotiation", () => {
  beforeEach(() => vi.stubEnv("PROFOUND_LOG_TOKEN", ""));
  afterEach(() => vi.unstubAllEnvs());

  it("serves an AI agent the Markdown of a post", () => {
    const response = proxy(
      viaSentryIo("/changelog/seer-agent-updates/", {
        "user-agent": BOT_UA,
        accept: BROWSER_ACCEPT,
      }),
    );
    expect(rewrittenTo(response)).toBe(
      "/api/changelog/seer-agent-updates/markdown/",
    );
    expect(response.headers.get("vary")).toBe("Accept, User-Agent");
  });

  it("serves an AI agent the Markdown of the index", () => {
    const response = proxy(
      viaSentryIo("/changelog/", { "user-agent": "ClaudeBot/1.0" }),
    );
    expect(rewrittenTo(response)).toBe("/api/changelog/markdown/");
  });

  it("serves a browser HTML", () => {
    const response = proxy(
      viaSentryIo("/changelog/seer-agent-updates/", {
        "user-agent": BROWSER_UA,
        accept: BROWSER_ACCEPT,
      }),
    );
    expect(rewrittenTo(response)).toBeNull();
  });

  it("serves Markdown to any client that asks for it in Accept", () => {
    const response = proxy(
      viaSentryIo("/changelog/seer-agent-updates/", {
        "user-agent": "curl/8.7.1",
        accept: "text/markdown, text/html;q=0.9",
      }),
    );
    expect(rewrittenTo(response)).toBe(
      "/api/changelog/seer-agent-updates/markdown/",
    );
  });

  it.each([
    "/changelog/_admin/",
    "/changelog/?page=2",
  ])("keeps HTML for an AI agent on %s, which has no Markdown", (path) => {
    const response = proxy(viaSentryIo(path, { "user-agent": BOT_UA }));
    expect(rewrittenTo(response)).toBeNull();
  });
});

describe("proxy Profound reporting", () => {
  const PROFOUND_URL = "https://artemis.api.tryprofound.com/v1/logs/custom";
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PROFOUND_LOG_TOKEN", "test-token");
    fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "accepted", errors: [] })),
      );
    vi.stubGlobal("fetch", fetchMock);
    after.mockClear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // Run the work proxy() deferred until after the response.
  const runAfter = () =>
    Promise.all(after.mock.calls.map(([callback]) => callback()));

  it("posts an AI agent's hit once, as seen on sentry.io", async () => {
    proxy(
      viaSentryIo("/changelog/seer-agent-updates/?utm_source=chatgpt.com", {
        "user-agent": BOT_UA,
        referer: "https://chatgpt.com/",
        // Vercel's client IP is nginx, not the agent.
        "x-real-ip": "10.0.0.1",
      }),
    );
    await runAfter();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(PROFOUND_URL);
    expect(init.headers["x-api-key"]).toBe("test-token");
    const entries = JSON.parse(init.body);
    expect(entries).toEqual([
      {
        timestamp: expect.any(String),
        method: "GET",
        host: "sentry.io",
        path: "/changelog/seer-agent-updates/",
        status_code: 200,
        ip: "203.0.113.7",
        user_agent: BOT_UA,
        query_params: { utm_source: "chatgpt.com" },
        referer: "https://chatgpt.com/",
      },
    ]);
    expect(Number.isNaN(Date.parse(entries[0].timestamp))).toBe(false);
  });

  it("also posts an AI agent's hit on an HTML page", async () => {
    proxy(viaSentryIo("/changelog/_admin/", { "user-agent": BOT_UA }));
    await runAfter();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)[0].path).toBe(
      "/changelog/_admin/",
    );
  });

  it("does not post browser visits", async () => {
    proxy(viaSentryIo("/changelog/", { "user-agent": BROWSER_UA }));
    await runAfter();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["outside production", { VERCEL_ENV: "preview" }],
    ["without a token", { PROFOUND_LOG_TOKEN: "" }],
  ])("does not post %s", async (_, env) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    proxy(viaSentryIo("/changelog/", { "user-agent": BOT_UA }));
    await runAfter();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["is unreachable", () => Promise.reject(new Error("network down"))],
    [
      "rejects the entry",
      () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              status: "accepted",
              errors: ["Invalid log format: timestamp out of reasonable range"],
            }),
          ),
        ),
    ],
  ])("still serves Markdown and logs it when Profound %s", async (_, reply) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockImplementation(reply);

    const response = proxy(
      viaSentryIo("/changelog/", { "user-agent": BOT_UA }),
    );
    await runAfter();

    expect(rewrittenTo(response)).toBe("/api/changelog/markdown/");
    expect(JSON.parse(error.mock.calls[0][0]).event).toBe(
      "profound_log_failed",
    );
  });
});
