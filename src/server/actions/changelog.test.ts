import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn() }));
vi.mock("../authOptions", () => ({ authOptions: {} }));

// Captured insert/update values — reset in beforeEach
let capturedChangelogInsert: Record<string, unknown> | null = null;
let capturedChangelogUpdate: Record<string, unknown> | null = null;

vi.mock("../db", () => {
  const makeInsertChain = (vals: unknown) => {
    const isChangelogRow =
      vals !== null && typeof vals === "object" && "slug" in (vals as object);
    if (isChangelogRow) {
      capturedChangelogInsert = vals as Record<string, unknown>;
    }
    return {
      onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
      returning: vi.fn().mockResolvedValue([{ id: "cl-1", title: "t" }]),
    };
  };

  return {
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockImplementation(makeInsertChain),
        onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockImplementation((vals: unknown) => {
          capturedChangelogUpdate = vals as Record<string, unknown>;
          return { where: vi.fn().mockResolvedValue(undefined) };
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([{ id: "user-1", slug: "original" }]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    },
  };
});

import { revalidatePath, updateTag } from "next/cache";
import { getServerSession } from "next-auth/next";
import {
  createChangelog,
  deleteChangelog,
  editChangelog,
  publishChangelog,
  unpublishChangelog,
} from "./changelog";

function buildFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.append(key, value);
    }
  }
  return fd;
}

describe("createChangelog platform persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedChangelogInsert = null;
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "test.user@sentry.io" },
    } as never);
  });

  it("persists only the platforms a user selected, dropping invalid slugs", async () => {
    const formData = buildFormData({
      title: "JS + Django release",
      content: "body",
      summary: "summary",
      image: "",
      slug: "js-django-release",
      categories: "",
      platform: ["javascript-react", "python-django", "not-a-real-platform"],
    });

    await createChangelog({}, formData);

    expect(capturedChangelogInsert).not.toBeNull();
    expect(capturedChangelogInsert?.platform).toEqual([
      "javascript-react",
      "python-django",
    ]);
  });

  it("persists an empty platform array when none are selected", async () => {
    const formData = buildFormData({
      title: "Untargeted post",
      content: "body",
      summary: "summary",
      image: "",
      slug: "untargeted-post",
      categories: "",
    });

    await createChangelog({}, formData);

    expect(capturedChangelogInsert?.platform).toEqual([]);
  });
});

describe("immediate article cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "test.user@sentry.io" },
    } as never);
  });

  it.each([
    ["create", createChangelog],
    ["edit", editChangelog],
    ["publish", publishChangelog],
    ["unpublish", unpublishChangelog],
    ["delete", deleteChangelog],
  ] as const)("%s expires the feed and article output after saving", async (_name, action) => {
    await action(
      {},
      buildFormData({
        id: "cl-1",
        title: "Updated",
        slug: "updated",
        summary: "Summary",
        content: "Body",
      }),
    );
    expect(updateTag).toHaveBeenCalledWith("changelogs");
    expect(updateTag).toHaveBeenCalledWith("changelog-recent");
    expect(updateTag).not.toHaveBeenCalledWith("changelog-detail");
    expect(revalidatePath).toHaveBeenCalledWith("/changelog", "page");
    const expectedSlug = _name === "create" ? "updated" : "original";
    expect(updateTag).toHaveBeenCalledWith(`changelog:${expectedSlug}`);
    expect(revalidatePath).toHaveBeenCalledWith(`/changelog/${expectedSlug}`);
    if (_name === "edit") {
      expect(updateTag).toHaveBeenCalledWith("changelog:updated");
      expect(revalidatePath).toHaveBeenCalledWith("/changelog/updated");
    }
  });

  it("does not invalidate public content for a rejected write", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    expect(await publishChangelog({}, buildFormData({ id: "cl-1" }))).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("editChangelog platform persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedChangelogUpdate = null;
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "test.user@sentry.io" },
    } as never);
  });

  it("updates the platform field with the selected (valid) slugs", async () => {
    const formData = buildFormData({
      id: "changelog-1",
      title: "Edited",
      content: "body",
      summary: "summary",
      image: "",
      slug: "edited",
      categories: "",
      platform: ["python-flask", "totally-bogus"],
    });

    await editChangelog({}, formData);

    expect(capturedChangelogUpdate).not.toBeNull();
    expect(capturedChangelogUpdate?.platform).toEqual(["python-flask"]);
  });
});

describe("targeted sync revalidation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalidates affected slugs and the feed without expiring every article", async () => {
    const { POST } = await import("@/app/api/revalidate/route");
    const { revalidateTag } = await import("next/cache");
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    try {
      const response = await POST(
        new Request("https://example.com/api/revalidate", {
          method: "POST",
          headers: { "x-revalidate-secret": "test-secret" },
          body: JSON.stringify({ slugs: ["original", "updated", "original"] }),
        }),
      );
      expect(response.status).toBe(200);
      expect(revalidateTag).toHaveBeenCalledWith("changelog:original", {
        expire: 0,
      });
      expect(revalidateTag).toHaveBeenCalledWith("changelog:updated", {
        expire: 0,
      });
      expect(revalidateTag).not.toHaveBeenCalledWith(
        "changelog-detail",
        expect.anything(),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/changelog", "page");
      expect(revalidatePath).not.toHaveBeenCalledWith("/changelog", "layout");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("preserves empty-body full refreshes from older sync callers", async () => {
    const { POST } = await import("@/app/api/revalidate/route");
    const { revalidateTag } = await import("next/cache");
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    try {
      expect(
        (
          await POST(
            new Request("https://example.com/api/revalidate", {
              method: "POST",
              headers: { "x-revalidate-secret": "test-secret" },
            }),
          )
        ).status,
      ).toBe(200);
      expect(revalidateTag).toHaveBeenCalledWith("changelog-detail", {
        expire: 0,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/changelog", "layout");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.each([
    [{ slugs: ["../private"] }, "test-secret", 400],
    [{ slugs: ["original"] }, "wrong-secret", 401],
  ])("rejects an invalid request before invalidating content", async (payload, secret, status) => {
    const { POST } = await import("@/app/api/revalidate/route");
    const { revalidateTag } = await import("next/cache");
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    try {
      expect(
        (
          await POST(
            new Request("https://example.com/api/revalidate", {
              method: "POST",
              headers: { "x-revalidate-secret": secret },
              body: JSON.stringify(payload),
            }),
          )
        ).status,
      ).toBe(status);
      expect(revalidateTag).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("bounds cache tags for the longest valid slugs without collisions", async () => {
    const { changelogTag } = await import("@/server/changelog-cache");
    const slug = "a".repeat(255);
    expect(changelogTag(slug).length).toBeLessThanOrEqual(256);
    expect(changelogTag(slug)).toBe(changelogTag(slug));
    expect(changelogTag(slug)).not.toBe(changelogTag(`${slug.slice(0, -1)}b`));
  });
});
