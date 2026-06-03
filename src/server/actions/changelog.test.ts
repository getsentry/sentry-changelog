import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
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
      vals !== null &&
      typeof vals === "object" &&
      "slug" in (vals as object);
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
            limit: vi.fn().mockResolvedValue([{ id: "user-1" }]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    },
  };
});

import { getServerSession } from "next-auth/next";
import { createChangelog, editChangelog } from "./changelog";

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
