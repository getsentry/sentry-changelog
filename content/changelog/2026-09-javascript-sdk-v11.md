---
title: JavaScript SDK v11
slug: javascript-sdk-v11
summary: Version 11 of the Sentry JavaScript SDK is out, with better OpenTelemetry compatibility and more complete instrumentation for Cloudflare, Bun and Deno. Spans are now streamed by default and `sendDefaultPii` is replaced by more granular data collection options.
categories:
  - SDK
platform:
  - javascript
  - node
  - bun
  - deno
broadcastCategory: sdk_update
published: false
date: 2026-09-23
author: andrei.borza@sentry.io
---

Version 11.0.0 of the Sentry JavaScript SDK is now available. The goal of this release is to be better compatible with OpenTelemetry, make our integrations work across Node.js, Cloudflare, Bun and Deno through run-time and build-time instrumentation, and make span streaming and more permissive data collection the default.

This is a major release with breaking changes. Read the [migration guide](https://docs.sentry.io/platforms/javascript/migration/v10-to-v11/) before you upgrade.

## New Features

- **Better OpenTelemetry compatibility:** Sentry no longer takes over your OpenTelemetry setup. You can keep your own [OpenTelemetry configuration](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/) next to Sentry.
- **Run-time and build-time instrumentation:** The SDK can instrument your code at run time or at build time. Build-time instrumentation gives better tracing on platforms like Vercel and Netlify.
- **Integrations for Cloudflare, Bun and Deno:** Our integrations now also work on [Cloudflare Workers](https://docs.sentry.io/platforms/javascript/guides/cloudflare/), [Bun](https://docs.sentry.io/platforms/javascript/guides/bun/) and [Deno](https://docs.sentry.io/platforms/javascript/guides/deno/).
- **Span streaming by default:** Spans are sent as they finish, so large traces are no longer cut off by size or span limits. Span names have low cardinality across all SDKs.
- **Granular data collection:** The new [`dataCollection`](https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection) option replaces `sendDefaultPii`. It gives you control per data type and has more permissive defaults.
- **Logs without a second opt-in:** The `enableLogs` option was removed. [Logs](https://docs.sentry.io/platforms/javascript/guides/node/logs/) are sent when you use `Sentry.logger` or a logging integration.
- **New integrations:** [Mastra](https://docs.sentry.io/platforms/javascript/guides/mastra/), [Mistral AI](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/mistral/), [Groq](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/groq/), [Together AI](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/together-ai/), [eve](https://docs.sentry.io/platforms/javascript/guides/eve/) and [Flue](https://docs.sentry.io/platforms/javascript/guides/node/agent-tracing/flue/), plus web vitals for soft navigations and back/forward cache restores.

## How to Upgrade

The [Sentry Wizard 8.0.0](https://github.com/getsentry/sentry-wizard/releases/tag/v8.0.0) installs v11 of the SDK for Angular, Cloudflare, Next.js, Nuxt, React Router, Remix and SvelteKit. For all other SDKs, follow the [setup guide in the Sentry docs](https://docs.sentry.io/platforms/javascript/).

- [v10 to v11 migration guide](https://docs.sentry.io/platforms/javascript/migration/v10-to-v11/) in the Sentry docs (select your platform or framework)
- [Full migration guide](https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md) in the SDK repository
- [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/11.0.0)
