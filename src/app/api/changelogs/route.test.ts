import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Mock Prisma client
const mockFindMany = vi.fn();
vi.mock("@/server/prisma-client", () => ({
  prismaClient: {
    changelog: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

function createRequest(url: string): Request {
  return new Request(`http://localhost${url}`);
}

const mockChangelog = {
  id: "test-id-1",
  title: "Test Changelog",
  slug: "test-changelog",
  summary: "Test summary",
  image: "https://example.com/image.png",
  content: "Test content",
  publishedAt: "2024-01-15T00:00:00.000Z",
  categories: [{ id: "cat-1", name: "SDK" }],
};

describe("GET /api/changelogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([mockChangelog]);
  });

  describe("basic functionality", () => {
    it("returns changelogs with default pagination", async () => {
      const response = await GET(createRequest("/api/changelogs"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockChangelog]);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true, deleted: false },
          take: 20,
          skip: 0,
        }),
      );
    });

    it("only queries published and non-deleted changelogs", async () => {
      await GET(createRequest("/api/changelogs"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            published: true,
            deleted: false,
          }),
        }),
      );
    });

    it("selects only safe fields (excludes authorId)", async () => {
      await GET(createRequest("/api/changelogs"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            image: true,
            content: true,
            publishedAt: true,
            categories: { select: { id: true, name: true } },
          },
        }),
      );
    });
  });

  describe("category filtering", () => {
    it("filters by category when provided", async () => {
      await GET(createRequest("/api/changelogs?category=SDK"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: { some: { name: "SDK" } },
          }),
        }),
      );
    });

    it("truncates category to MAX_CATEGORY_LENGTH", async () => {
      const longCategory = "a".repeat(200);
      await GET(createRequest(`/api/changelogs?category=${longCategory}`));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: { some: { name: "a".repeat(100) } },
          }),
        }),
      );
    });
  });

  describe("date filtering", () => {
    it("filters by from date", async () => {
      await GET(createRequest("/api/changelogs?from=2024-01-01"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publishedAt: { gte: new Date("2024-01-01") },
          }),
        }),
      );
    });

    it("filters by to date", async () => {
      await GET(createRequest("/api/changelogs?to=2024-12-31"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publishedAt: { lte: new Date("2024-12-31") },
          }),
        }),
      );
    });

    it("filters by date range", async () => {
      await GET(createRequest("/api/changelogs?from=2024-01-01&to=2024-12-31"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publishedAt: {
              gte: new Date("2024-01-01"),
              lte: new Date("2024-12-31"),
            },
          }),
        }),
      );
    });

    it("returns 400 for invalid from date", async () => {
      const response = await GET(createRequest("/api/changelogs?from=invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid 'from' date format");
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid to date", async () => {
      const response = await GET(
        createRequest("/api/changelogs?to=not-a-date"),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid 'to' date format");
      expect(mockFindMany).not.toHaveBeenCalled();
    });
  });

  describe("search functionality", () => {
    it("searches in title and summary", async () => {
      await GET(createRequest("/api/changelogs?search=performance"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { search: "performance" } },
              { summary: { search: "performance" } },
            ],
          }),
        }),
      );
    });

    it("sanitizes search input - removes dangerous operators", async () => {
      await GET(createRequest("/api/changelogs?search=test%26%7C%21%3A*"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { search: "test" } },
              { summary: { search: "test" } },
            ],
          }),
        }),
      );
    });

    it("truncates search to MAX_SEARCH_LENGTH", async () => {
      const longSearch = "a".repeat(200);
      await GET(createRequest(`/api/changelogs?search=${longSearch}`));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { search: "a".repeat(100) } },
              { summary: { search: "a".repeat(100) } },
            ],
          }),
        }),
      );
    });
  });

  describe("pagination", () => {
    it("respects limit parameter", async () => {
      await GET(createRequest("/api/changelogs?limit=50"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it("caps limit at 100", async () => {
      await GET(createRequest("/api/changelogs?limit=500"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it("uses default limit when 0 is provided (falsy value)", async () => {
      await GET(createRequest("/api/changelogs?limit=0"));

      // 0 is falsy so || 20 kicks in, then Math.max(1, 20) = 20
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });

    it("enforces minimum limit of 1 for negative values", async () => {
      await GET(createRequest("/api/changelogs?limit=-5"));

      // Math.max(1, -5) = 1
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });

    it("respects offset parameter", async () => {
      await GET(createRequest("/api/changelogs?offset=20"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20 }),
      );
    });

    it("prevents negative offset", async () => {
      await GET(createRequest("/api/changelogs?offset=-10"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0 }),
      );
    });
  });

  describe("error handling", () => {
    it("returns 500 and captures exception on database error", async () => {
      const { captureException } = await import("@sentry/nextjs");
      const dbError = new Error("Database connection failed");
      mockFindMany.mockRejectedValue(dbError);

      const response = await GET(createRequest("/api/changelogs"));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch changelogs");
      expect(captureException).toHaveBeenCalledWith(dbError);
    });

    it("does not leak internal error details", async () => {
      mockFindMany.mockRejectedValue(new Error("Sensitive DB info here"));

      const response = await GET(createRequest("/api/changelogs"));
      const data = await response.json();

      expect(data.error).toBe("Failed to fetch changelogs");
      expect(JSON.stringify(data)).not.toContain("Sensitive");
    });
  });

  describe("ordering", () => {
    it("orders by publishedAt descending", async () => {
      await GET(createRequest("/api/changelogs"));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { publishedAt: "desc" },
        }),
      );
    });
  });
});
