import type { Element, Root } from "hast";
import { describe, expect, it } from "vitest";
import rehypeChangelogAssetPaths from "./rehype-changelog-asset-paths";

const img = (src: string): Element => ({
  type: "element",
  tagName: "img",
  properties: { src },
  children: [],
});

function rewrite(src: string) {
  const node = img(src);
  const tree: Root = { type: "root", children: [node] };
  rehypeChangelogAssetPaths()(tree);
  return node.properties.src;
}

describe("rehypeChangelogAssetPaths", () => {
  it("serves public images under /changelog/", () => {
    expect(rewrite("/img/changelog/2026-11-custom-inbound-filters.png")).toBe(
      "/changelog/img/changelog/2026-11-custom-inbound-filters.png",
    );
  });

  it.each([
    "https://images.ctfassets.net/a/b.png",
    "/changelog/img/changelog/a.png",
    "//example.com/img/a.png",
  ])("leaves %s alone", (src) => {
    expect(rewrite(src)).toBe(src);
  });
});
