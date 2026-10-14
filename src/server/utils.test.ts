import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { defaultFeedQuery, getFeedPage } from "@/lib/changelog-feed";
import {
  _CategoryToChangelog,
  type CategoryModel,
  type ChangelogModel,
} from "@/server/db/schema";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("next/cache", () => ({ cacheTag: vi.fn() }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: vi.fn(),
}));

const mockedDb = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock("@/server/db", () => ({ db: mockedDb }));

type Entry = ChangelogModel & { categories: CategoryModel[] };

let databaseEntries: Entry[];
let temporaryRoot: string;
let contentDirectory: string;
let utils: typeof import("./utils");
let getMarkdownIndex: typeof import("@/app/api/changelog/markdown/route").GET;
let getMarkdownDetail: typeof import("@/app/api/changelog/[slug]/markdown/route").GET;
let getFeed: typeof import("@/app/changelog/feed.xml/route").GET;

function databaseEntry(slug: string, fields: Partial<Entry> = {}): Entry {
  return {
    id: `database-${slug}`,
    title: `Database ${slug}`,
    slug,
    summary: "Database summary",
    content: "Database body",
    image: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
    publishedAt: new Date("2026-09-01T00:00:00Z"),
    published: true,
    deleted: false,
    adminManaged: false,
    platform: [],
    broadcastCategory: null,
    authorId: null,
    categories: [],
    ...fields,
  };
}

function createQuery(selection?: Record<string, unknown>) {
  let rows: unknown[] = [];
  const query = Object.assign(
    Promise.resolve().then(() => rows),
    {
      from: vi.fn((table: unknown) => {
        rows =
          table === _CategoryToChangelog
            ? databaseEntries.flatMap((entry) =>
                entry.categories.map((category) => ({
                  changelogId: entry.id,
                  category,
                })),
              )
            : databaseEntries.map(({ categories: _categories, ...entry }) =>
                selection
                  ? Object.fromEntries(
                      Object.keys(selection).map((key) => [
                        key,
                        entry[key as keyof typeof entry],
                      ]),
                    )
                  : entry,
              );
        return query;
      }),
      innerJoin: vi.fn(() => query),
      where: vi.fn(() => query),
      orderBy: vi.fn(() => query),
      limit: vi.fn(() => query),
    },
  );
  return query;
}

async function writeEntry(
  slug: string,
  frontmatter: Record<string, unknown> = {},
  content = "Branch body with **details**.",
) {
  // JSON values are valid YAML, including strings that contain Markdown.
  const fields = {
    title: `Branch ${slug}`,
    published: true,
    date: "2026-10-05",
    ...frontmatter,
  };
  const yaml = Object.entries(fields)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  await writeFile(
    path.join(contentDirectory, `${slug}.md`),
    `---\n${yaml}\n---\n${content}\n`,
  );
}

beforeAll(async () => {
  temporaryRoot = await mkdtemp(path.join(tmpdir(), "changelog-preview-test-"));
  contentDirectory = path.join(temporaryRoot, "content", "changelog");
  const cwd = vi.spyOn(process, "cwd").mockReturnValue(temporaryRoot);
  try {
    utils = await import("./utils");
    ({ GET: getMarkdownIndex } = await import(
      "@/app/api/changelog/markdown/route"
    ));
    ({ GET: getMarkdownDetail } = await import(
      "@/app/api/changelog/[slug]/markdown/route"
    ));
    ({ GET: getFeed } = await import("@/app/changelog/feed.xml/route"));
  } finally {
    cwd.mockRestore();
  }
});

beforeEach(async () => {
  await rm(contentDirectory, { recursive: true, force: true });
  await mkdir(contentDirectory, { recursive: true });
  databaseEntries = [];
  vi.stubEnv("VERCEL_ENV", "preview");
  mockedDb.select.mockImplementation(createQuery);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

afterAll(async () => {
  await rm(temporaryRoot, { recursive: true, force: true });
});

describe("branch changelog previews", () => {
  it("shows branch content in the list, detail, and searchable summary before database sync", async () => {
    await writeEntry("new-mcp-tools", {
      title: "New MCP tools",
      summary: "Inspect **MCP tools** and [read more](https://example.com).",
      categories: ["MCP"],
      platform: ["javascript"],
      broadcastCategory: "feature",
    });

    const entries = await utils.getChangelogs();
    const detail = await utils.getChangelog("new-mcp-tools");
    const summaries = await utils.getChangelogSummaries();

    expect(entries).toHaveLength(1);
    expect(detail).toMatchObject({
      slug: "new-mcp-tools",
      title: "New MCP tools",
      content: "Branch body with **details**.",
      publishedAt: new Date("2026-10-05T00:00:00Z"),
      categories: [{ name: "MCP" }],
      platform: ["javascript"],
      broadcastCategory: "feature",
    });
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      slug: "new-mcp-tools",
      title: "New MCP tools",
    });
    expect(summaries[0].summary).toContain("**MCP tools**");
    expect(summaries[0].searchText).toContain("inspect");
    expect(summaries[0]).not.toHaveProperty("mdxSummary");
  });

  it("replaces file-managed content by slug and reuses database category identity", async () => {
    const category = {
      id: "database-category-mcp",
      name: "MCP",
      deleted: false,
    };
    databaseEntries = [
      databaseEntry("existing", { categories: [category] }),
      databaseEntry("database-only"),
    ];
    await writeEntry(
      "existing",
      { title: "Updated in this branch", categories: ["MCP"] },
      "Updated body.",
    );
    await writeEntry("new-entry", { categories: ["MCP"] });

    const entries = await utils.getChangelogs();

    expect(entries.filter((entry) => entry.slug === "existing")).toHaveLength(
      1,
    );
    expect(entries.find((entry) => entry.slug === "existing")).toMatchObject({
      id: "database-existing",
      title: "Updated in this branch",
      content: "Updated body.",
      categories: [category],
    });
    expect(
      entries.find((entry) => entry.slug === "new-entry")?.categories,
    ).toEqual([category]);
    expect(entries.find((entry) => entry.slug === "database-only")).toEqual(
      databaseEntries[1],
    );
  });

  it("uses explicit frontmatter slugs for MDX files in detail and RSS responses", async () => {
    await writeFile(
      path.join(contentDirectory, "draft-filename.mdx"),
      [
        "---",
        "title: New MCP tools",
        "slug: new-mcp-tools",
        "summary: New tools from this branch.",
        "published: true",
        "date: 2026-10-05",
        "categories: [MCP]",
        "---",
        "<section>New **MCP** tools.</section>",
      ].join("\n"),
    );

    expect(await utils.getChangelog("new-mcp-tools")).toMatchObject({
      title: "New MCP tools",
      content: "<section>New **MCP** tools.</section>",
    });
    expect(await utils.getChangelog("draft-filename")).toBeNull();

    const response = await getFeed();
    const xml = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");
    expect(xml).toContain("<title><![CDATA[New MCP tools]]></title>");
    expect(xml).toContain(
      "<link>https://sentry.io/changelog/new-mcp-tools</link>",
    );
    expect(xml).toContain("New tools from this branch.");
    expect(xml).not.toContain("draft-filename");
  });

  it("keeps admin-managed edits and does not resurrect admin-managed drafts or deletions", async () => {
    databaseEntries = [
      databaseEntry("admin-edit", { adminManaged: true }),
      databaseEntry("admin-draft", { adminManaged: true, published: false }),
      databaseEntry("admin-deletion", { adminManaged: true, deleted: true }),
    ];
    for (const entry of databaseEntries) await writeEntry(entry.slug);

    expect(await utils.getChangelogs()).toEqual([databaseEntries[0]]);
    expect(await utils.getChangelog("admin-edit")).toEqual(databaseEntries[0]);
    expect(await utils.getChangelog("admin-draft")).toEqual(databaseEntries[1]);
    expect(await utils.getChangelog("admin-deletion")).toBeNull();
  });

  it("hides file drafts and tombstones from public lists while preserving draft detail for the auth gate", async () => {
    databaseEntries = [databaseEntry("draft"), databaseEntry("removed")];
    await writeEntry("draft", { published: false });
    await writeEntry("removed", { deleted: true }, "");

    expect(await utils.getChangelogs()).toEqual([]);
    expect(await utils.getRecentChangelogs()).toEqual([]);
    expect(await utils.getChangelog("draft")).toMatchObject({
      published: false,
      title: "Branch draft",
    });
    expect(await utils.getChangelog("removed")).toBeNull();
  });

  it("returns four recent metadata candidates sorted by merged publication dates", async () => {
    databaseEntries = [
      databaseEntry("old"),
      databaseEntry("database-recent", { publishedAt: new Date("2026-10-04") }),
    ];
    await writeEntry("newest", { date: "2026-10-06" });
    await writeEntry("current", { date: "2026-10-05" });
    await writeEntry("third", { date: "2026-10-03" });

    expect((await utils.getChangelogs()).map((entry) => entry.slug)).toEqual([
      "newest",
      "current",
      "database-recent",
      "third",
      "old",
    ]);
    expect(
      (await utils.getRecentChangelogs()).map((entry) => entry.slug),
    ).toEqual(["newest", "current", "database-recent", "third"]);
  });

  it("preserves existing publication dates when a file does not specify a date", async () => {
    databaseEntries = [databaseEntry("existing")];
    await writeFile(
      path.join(contentDirectory, "existing.md"),
      "---\ntitle: Updated\npublished: true\n---\nUpdated body.\n",
    );
    await writeFile(
      path.join(contentDirectory, "new-entry.md"),
      "---\ntitle: New\npublished: true\n---\nNew body.\n",
    );
    const before = Date.now();

    const entries = await utils.getChangelogs();

    expect(
      entries.find((entry) => entry.slug === "existing")?.publishedAt,
    ).toEqual(databaseEntries[0].publishedAt);
    const newDate = entries
      .find((entry) => entry.slug === "new-entry")
      ?.publishedAt?.getTime();
    expect(newDate).toBeGreaterThanOrEqual(before);
    expect(newDate).toBeLessThanOrEqual(Date.now());
  });

  it.each([
    "production",
    "development",
    "staging",
    undefined,
  ])("ignores branch files outside the exact Vercel preview environment (%s)", async (environment) => {
    vi.stubEnv("VERCEL_ENV", environment);
    databaseEntries = [databaseEntry("database-only")];
    await writeFile(
      path.join(contentDirectory, "invalid.md"),
      "---\ntitle: [invalid]\n---\nBody.",
    );

    expect(await utils.getChangelogs()).toEqual(databaseEntries);
    expect(await utils.getChangelog("database-only")).toEqual(
      databaseEntries[0],
    );
    expect(await utils.getRecentChangelogs()).toEqual(
      databaseEntries.map(({ slug, title, image, publishedAt }) => ({
        slug,
        title,
        image,
        publishedAt,
      })),
    );
  });

  it("rejects invalid branch frontmatter instead of silently showing stale database content", async () => {
    databaseEntries = [databaseEntry("invalid")];
    await writeEntry("invalid", { title: ["not a string"] });

    await expect(utils.getChangelogs()).rejects.toThrow(/title/);
    await expect(utils.getChangelog("invalid")).rejects.toThrow(/title/);
    await expect(utils.getRecentChangelogs()).rejects.toThrow(/title/);
  });

  it("propagates database outages instead of caching an article as missing", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    mockedDb.select.mockImplementationOnce(() => {
      throw new Error("Database unavailable");
    });
    await expect(utils.getChangelog("existing-entry")).rejects.toThrow(
      "Database unavailable",
    );
  });

  it("ignores README and template files with no frontmatter", async () => {
    await writeFile(
      path.join(contentDirectory, "README.md"),
      "Documentation, not an entry.",
    );
    await writeFile(
      path.join(contentDirectory, "_template.md"),
      "Template, not an entry.",
    );
    await writeEntry("published-entry");

    expect((await utils.getChangelogs()).map((entry) => entry.slug)).toEqual([
      "published-entry",
    ]);
  });

  it("serves the same branch content through the Copy page Markdown routes", async () => {
    await writeEntry(
      "new-mcp-tools",
      { title: "New MCP tools", summary: "Branch summary." },
      "Branch **MCP** body.",
    );

    const index = await getMarkdownIndex();
    const detail = await getMarkdownDetail(
      new Request("https://example.com/api/changelog/new-mcp-tools/markdown"),
      {
        params: Promise.resolve({ slug: "new-mcp-tools" }),
      },
    );

    expect(index.status).toBe(200);
    expect(await index.text()).toContain(
      "[New MCP tools](https://sentry.io/changelog/new-mcp-tools)",
    );
    expect(detail.status).toBe(200);
    expect(await detail.text()).toContain("Branch **MCP** body.");
  });

  it.each([
    { published: false },
    { deleted: true },
  ])("keeps private or deleted branch content out of Markdown responses (%j)", async (frontmatter) => {
    await writeEntry("hidden-entry", frontmatter);

    const index = await getMarkdownIndex();
    const detail = await getMarkdownDetail(
      new Request("https://example.com/api/changelog/hidden-entry/markdown"),
      {
        params: Promise.resolve({ slug: "hidden-entry" }),
      },
    );

    expect(await index.text()).not.toContain("hidden-entry");
    expect(detail.status).toBe(404);
  });
});

describe("feed filtering and page boundaries", () => {
  it("searches summary text without matching missing summaries as undefined", async () => {
    await writeEntry("summary-search", {
      summary: "A unique breadcrumbneedle detail",
    });
    await writeEntry("empty-summary");
    const entries = await utils.getChangelogSummaries();
    expect(
      getFeedPage(entries, {
        ...defaultFeedQuery,
        search: "breadcrumbneedle",
      }).entries.map(({ slug }) => slug),
    ).toEqual(["summary-search"]);
    expect(
      getFeedPage(entries, { ...defaultFeedQuery, search: "undefined" })
        .entries,
    ).toEqual([]);
  });

  it("clamps invalid pages and keeps matching month options in publication order", async () => {
    for (let i = 0; i < 12; i++)
      await writeEntry(`entry-${i}`, {
        date: i < 2 ? "2026-10-05" : "2026-09-05",
      });
    const entries = await utils.getChangelogSummaries();
    for (const page of [0, -1, NaN]) {
      expect(getFeedPage(entries, { ...defaultFeedQuery, page }).page).toBe(1);
      expect(
        getFeedPage(entries, { ...defaultFeedQuery, page }).entries,
      ).toHaveLength(10);
    }
    expect(
      getFeedPage(entries, { ...defaultFeedQuery, page: 999 }).entries,
    ).toHaveLength(2);
    const october = getFeedPage(entries, {
      ...defaultFeedQuery,
      month: "October 2026",
      page: 99,
    });
    expect(october.page).toBe(1);
    expect(october.entries).toHaveLength(2);
    expect(october.months).toEqual(["October 2026", "September 2026"]);
  });
});
