import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  trailingSlash: true,
  transpilePackages: ["next-mdx-remote"],
  outputFileTracingIncludes: {
    "/changelog": ["./content/changelog/**/*"],
    "/changelog/**": ["./content/changelog/**/*"],
    "/api/changelog/**": ["./content/changelog/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      ...[
        "images.ctfassets.net",
        "lh7-qw.googleusercontent.com",
        "lh3.googleusercontent.com",
      ].map((hostname) => ({ protocol: "https", hostname })),
    ],
  },
  // sentry.io only proxies /changelog/ to this app, so entry images in
  // public/img need a path under it. See src/server/rehype-changelog-asset-paths.ts.
  async rewrites() {
    return [{ source: "/changelog/img/:path*", destination: "/img/:path*" }];
  },
  async redirects() {
    return [
      // sentry.io/changelog/ is the canonical URL, so send pages on
      // changelog.sentry.dev there. sentry.io proxies to this app through
      // sentry-changelog.sentry.dev, which keeps serving pages. The API, admin,
      // auth and static files stay on changelog.sentry.dev: getsentry,
      // NextAuth and sentry.io pages load them from there.
      {
        source: "/",
        has: [{ type: "host", value: "changelog.sentry.dev" }],
        destination: "https://sentry.io/changelog/",
        permanent: true,
      },
      {
        source: "/changelog/:path((?!_admin).*)",
        has: [{ type: "host", value: "changelog.sentry.dev" }],
        destination: "https://sentry.io/changelog/:path",
        permanent: true,
      },
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

  // Route Sentry events through the server to avoid ad blockers. The path must
  // be under /changelog/, the only prefix sentry.io proxies to this app.
  tunnelRoute: "/changelog/sentry-tunnel",

  // Marks first-party code for `thirdPartyErrorFilterIntegration`
  applicationKey: "sentry-changelog",

  _experimental: {
    thirdPartyOriginStackFrames: true,
    turbopackReactComponentAnnotation: {
      enabled: true,
    },
  },
});
