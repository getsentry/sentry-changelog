import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// sentry.io only proxies /changelog/* and /_next/* to this app. Any other
// root-relative path, such as /img/foo.png, is served by the Sentry app on
// sentry.io and breaks there, even though it works on changelog.sentry.dev.
const root = path.resolve(__dirname, "../..");

describe("public assets", () => {
  it("live under public/changelog/", () => {
    // The favicon and fonts are loaded from absolute changelog.sentry.dev URLs.
    const allowed = [
      "changelog",
      "favicon.ico",
      "favicon_localhost.png",
      "fonts",
    ];
    for (const entry of readdirSync(path.join(root, "public"))) {
      expect(allowed).toContain(entry);
    }
  });

  it("are referenced from changelog content under /changelog/", () => {
    const dir = path.join(root, "content/changelog");
    for (const file of readdirSync(dir)) {
      const text = readFileSync(path.join(dir, file), "utf8");
      // Markdown images and the `image:` frontmatter field.
      const imagePaths = text.matchAll(/(?:!\[[^\]]*\]\(|^image:\s*)(\/\S*)/gm);
      for (const [, imagePath] of imagePaths) {
        expect(imagePath, file).toMatch(/^\/changelog\//);
      }
    }
  });
});
