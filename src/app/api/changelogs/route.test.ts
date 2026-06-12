import { beforeEach, describe, expect, it, vi } from "vitest";
import { _CategoryToChangelog, Category, Changelog } from "@/server/db/schema";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

type QueryBuilder = {
  from: ReturnType<typeof vi.fn>;
  innerJoin: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  offset: ReturnType<typeof vi.fn>;
};

function createQueryBuilder(result: unknown): QueryBuilder {
  const execute = async () => {
    if (result instanceof Error) {
      throw result;
    }

    return result;
  };

  const builder: QueryBuilder & PromiseLike<unknown> = Object.assign(
    Promise.resolve(execute()),
    {
      from: vi.fn(() => builder),
      innerJoin: vi.fn(() => builder),
      where: vi.fn(() => builder),
      orderBy: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      offset: vi.fn(() => builder),
    },
  );

  return builder;
}

type QueryInvocation = {
  selection: unknown;
  builder: QueryBuilder;
};

let GET: typeof import("./route").GET;

const mockedDb = vi.hoisted(() => ({
  select: vi.fn(),
  selectDistinct: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  db: {
    select: mockedDb.select,
    selectDistinct: mockedDb.selectDistinct,
  },
}));

let selectPayloadQueue: unknown[] = [];
let selectDistinctPayloadQueue: unknown[] = [];
const selectInvocations: QueryInvocation[] = [];
const selectDistinctInvocations: QueryInvocation[] = [];

function setSelectResponses(responses: unknown[]) {
  selectPayloadQueue = responses;
  mockedDb.select.mockImplementation((selection: unknown) => {
    const next = selectPayloadQueue.shift() ?? [];
    const builder = createQueryBuilder(next);

    selectInvocations.push({ selection, builder });

    return builder;
  });
}

function setSelectDistinctResponses(responses: unknown[]) {
  selectDistinctPayloadQueue = responses;
  mockedDb.selectDistinct.mockImplementation((selection: unknown) => {
    const next = selectDistinctPayloadQueue.shift() ?? [];
    const builder = createQueryBuilder(next);

    selectDistinctInvocations.push({ selection, builder });

    return builder;
  });
}

function createRequest(url: string): Request {
  return new Request(`http://localhost${url}`);
}

const mockChangelogRow = {
  id: "test-id-1",
  title: "Test Changelog",
  slug: "test-changelog",
  summary: "Test summary",
  image: "https://example.com/image.png",
  content: "Test content",
  publishedAt: "2024-01-15T00:00:00.000Z",
  categories: [{ id: "cat-1", name: "SDK" }],
};

function getMainQueryInvocation() {
  return selectInvocations[0];
}

describe("GET /api/changelogs", () => {
  beforeEach(async () => {
    if (!GET) {
      ({ GET } = await import("./route"));
    }

    vi.clearAllMocks();

    selectInvocations.length = 0;
    selectDistinctInvocations.length = 0;

    setSelectResponses([
      [mockChangelogRow],
      [{ changelogId: "test-id-1", category: mockChangelogRow.categories[0] }],
    ]);
    setSelectDistinctResponses([[{ id: "test-id-1" }]]);
  });

  describe("basic functionality", () => {
    it("returns changelogs with default pagination", async () => {
      const response = await GET(createRequest("/api/changelogs"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockChangelogRow]);
      expect(mockedDb.select).toHaveBeenCalledTimes(2);
    });

    it("only queries published and non-deleted changelogs", async () => {
      await GET(createRequest("/api/changelogs"));

      const mainQuery = getMainQueryInvocation().builder;

      expect(mainQuery.where).toHaveBeenCalled();
      expect(mainQuery.orderBy).toHaveBeenCalledWith(expect.any(Object));
    });

    it("selects only safe fields (excludes authorId)", async () => {
      await GET(createRequest("/api/changelogs"));

      expect(getMainQueryInvocation().selection).toEqual({
        id: Changelog.id,
        title: Changelog.title,
        slug: Changelog.slug,
        summary: Changelog.summary,
        image: Changelog.image,
        content: Changelog.content,
        publishedAt: Changelog.publishedAt,
        platform: Changelog.platform,
        broadcastCategory: Changelog.broadcastCategory,
      });
    });
  });

  describe("category filtering", () => {
    it("filters by category when provided", async () => {
      setSelectDistinctResponses([[{ B: "test-id-1" }]]);
      setSelectResponses([
        [mockChangelogRow],
        [
          {
            changelogId: "test-id-1",
            category: mockChangelogRow.categories[0],
          },
        ],
      ]);

      await GET(createRequest("/api/changelogs?category=SDK"));

      expect(mockedDb.selectDistinct).toHaveBeenCalledWith({
        id: _CategoryToChangelog.B,
      });
      expect(
        mockedDb.selectDistinct.mock.results[0]?.value?.from,
      ).toHaveBeenCalledWith(_CategoryToChangelog);
      expect(
        selectDistinctInvocations[0].builder.innerJoin,
      ).toHaveBeenCalledWith(Category, expect.any(Object));
      expect(mockedDb.select).toHaveBeenCalledWith(
        expect.objectContaining({
          id: Changelog.id,
          title: Changelog.title,
        }),
      );
    });

    it("returns empty result when category has no matches", async () => {
      setSelectDistinctResponses([[]]);

      const response = await GET(
        createRequest("/api/changelogs?category=Missing"),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(mockedDb.select).not.toHaveBeenCalled();
    });

    it("truncates category to MAX_CATEGORY_LENGTH", async () => {
      const longCategory = "a".repeat(200);
      await GET(createRequest(`/api/changelogs?category=${longCategory}`));

      expect(mockedDb.selectDistinct.mock.calls[0]?.[0]).toEqual({
        id: _CategoryToChangelog.B,
      });
    });
  });

  describe("date filtering", () => {
    it("filters by from date", async () => {
      const searchParams = new URLSearchParams({ from: "2024-01-01" });
      await GET(createRequest(`/api/changelogs?${searchParams}`));

      expect(getMainQueryInvocation().builder.where).toHaveBeenCalled();
    });

    it("filters by to date", async () => {
      const searchParams = new URLSearchParams({ to: "2024-12-31" });
      await GET(createRequest(`/api/changelogs?${searchParams}`));

      expect(getMainQueryInvocation().builder.where).toHaveBeenCalled();
    });

    it("returns 400 for invalid from date", async () => {
      const response = await GET(createRequest("/api/changelogs?from=invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid 'from' date format");
      expect(mockedDb.select).not.toHaveBeenCalled();
      expect(mockedDb.selectDistinct).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid to date", async () => {
      const response = await GET(
        createRequest("/api/changelogs?to=not-a-date"),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid 'to' date format");
      expect(mockedDb.select).not.toHaveBeenCalled();
      expect(mockedDb.selectDistinct).not.toHaveBeenCalled();
    });
  });

  describe("search functionality", () => {
    it("searches in title and summary with ILIKE", async () => {
      await GET(createRequest("/api/changelogs?search=performance"));

      expect(getMainQueryInvocation().builder.where).toHaveBeenCalled();
    });

    it("accepts operator-like search strings", async () => {
      await GET(createRequest("/api/changelogs?search=test%26%7C%21%3A*"));

      expect(getMainQueryInvocation().builder.where).toHaveBeenCalled();
    });

    it("truncates search to MAX_SEARCH_LENGTH", async () => {
      const longSearch = "a".repeat(200);
      await GET(createRequest(`/api/changelogs?search=${longSearch}`));

      expect(getMainQueryInvocation().builder.where).toHaveBeenCalled();
    });
  });

  describe("pagination", () => {
    it("respects limit parameter", async () => {
      await GET(createRequest("/api/changelogs?limit=50"));

      expect(getMainQueryInvocation().builder.limit).toHaveBeenCalledWith(50);
    });

    it("caps limit at 100", async () => {
      await GET(createRequest("/api/changelogs?limit=500"));

      expect(getMainQueryInvocation().builder.limit).toHaveBeenCalledWith(100);
    });

    it("uses default limit when 0 is provided", async () => {
      await GET(createRequest("/api/changelogs?limit=0"));

      expect(getMainQueryInvocation().builder.limit).toHaveBeenCalledWith(20);
    });

    it("enforces minimum limit of 1 for negative values", async () => {
      await GET(createRequest("/api/changelogs?limit=-5"));

      expect(getMainQueryInvocation().builder.limit).toHaveBeenCalledWith(1);
    });

    it("respects offset parameter", async () => {
      await GET(createRequest("/api/changelogs?offset=20"));

      expect(getMainQueryInvocation().builder.offset).toHaveBeenCalledWith(20);
    });

    it("prevents negative offset", async () => {
      await GET(createRequest("/api/changelogs?offset=-10"));

      expect(getMainQueryInvocation().builder.offset).toHaveBeenCalledWith(0);
    });
  });

  describe("error handling", () => {
    it("returns 500 and captures exception on database error", async () => {
      const { captureException } = await import("@sentry/nextjs");
      setSelectResponses([new Error("Database connection failed")]);

      const response = await GET(createRequest("/api/changelogs"));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch changelogs");
      expect(captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Database connection failed" }),
      );
    });

    it("does not leak internal error details", async () => {
      setSelectResponses([new Error("Sensitive DB info here")]);

      const response = await GET(createRequest("/api/changelogs"));
      const data = await response.json();

      expect(data.error).toBe("Failed to fetch changelogs");
      expect(JSON.stringify(data)).not.toContain("Sensitive");
    });
  });

  describe("ordering", () => {
    it("orders by publishedAt descending", async () => {
      await GET(createRequest("/api/changelogs"));

      expect(getMainQueryInvocation().builder.orderBy).toHaveBeenCalled();
    });
  });
});
