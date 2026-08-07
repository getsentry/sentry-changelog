import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  trailingSlash: true,
  transpilePackages: ["next-mdx-remote"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
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

  // Route Sentry events through the server to avoid ad blockers
  tunnelRoute: "/sentry-tunnel",

  // Marks first-party code for `thirdPartyErrorFilterIntegration`
  applicationKey: "sentry-changelog",

  _experimental: {
    thirdPartyOriginStackFrames: true,
    turbopackReactComponentAnnotation: {
      enabled: true,
    },
  },
});
