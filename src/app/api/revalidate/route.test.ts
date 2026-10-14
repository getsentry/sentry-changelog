import { revalidateTag } from "next/cache";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("content sync revalidation", () => {
  it("expires both caches immediately after an authenticated sync", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    const response = await POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        headers: { "x-revalidate-secret": "test-secret" },
      }),
    );
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("changelogs", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("changelog-detail", {
      expire: 0,
    });
  });

  it.each([
    undefined,
    "wrong-secret",
  ])("rejects an unauthorized sync (%s)", async (secret) => {
    vi.stubEnv("REVALIDATE_SECRET", "test-secret");
    const response = await POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        headers: secret ? { "x-revalidate-secret": secret } : {},
      }),
    );
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
