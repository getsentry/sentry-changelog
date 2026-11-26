import rehypePrismPlus from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";

import rehypeChangelogAssetPaths from "./rehype-changelog-asset-paths";
import remarkComponentSpacing from "./remark-component-spacing";
import remarkExtractFrontmatter from "./remark-extract-frontmatter";

export const mdxOptions = {
  remarkPlugins: [remarkExtractFrontmatter, remarkComponentSpacing],
  rehypePlugins: [
    rehypeSlug,
    [rehypePrismPlus, { ignoreMissing: true }],
    rehypeChangelogAssetPaths,
  ],
};
