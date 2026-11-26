import type { Root, RootContent } from "hast";

// sentry.io only proxies /changelog/ to this app, so a root-relative /img/...
// path in an entry body would hit the main Sentry app instead. next.config.mjs
// serves public/img under /changelog/img, and this plugin points entry images
// there.
const rehypeChangelogAssetPaths = () => (tree: Root) => {
  function walk(node: Root | RootContent) {
    if (node.type === "element" && node.tagName === "img") {
      const { src } = node.properties;
      if (typeof src === "string" && src.startsWith("/img/")) {
        node.properties.src = `/changelog${src}`;
      }
    }
    if ("children" in node) node.children.forEach(walk);
  }
  walk(tree);
};

export default rehypeChangelogAssetPaths;
