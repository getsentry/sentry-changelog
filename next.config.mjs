import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  transpilePackages: ["next-mdx-remote"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/changelog",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "sentry",
  project: "changelog",

  // Suppresses source map uploading logs during build
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  _experimental: {
    thirdPartyOriginStackFrames: true,
    turbopackApplicationKey: "sentry-changelog"
  },
});
