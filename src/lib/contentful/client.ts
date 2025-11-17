import { createClient } from "contentful";

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken =
  process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  console.warn(
    "Contentful credentials not found. Navigation will use fallback data.",
  );
}

export const contentfulClient =
  spaceId && accessToken
    ? createClient({
        space: spaceId,
        accessToken: accessToken,
        environment: "master",
        host: process.env.CONTENTFUL_PREVIEW_TOKEN
          ? "preview.contentful.com"
          : undefined,
      })
    : null;
