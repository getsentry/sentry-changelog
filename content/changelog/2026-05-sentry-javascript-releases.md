---
title: JavaScript SDK Releases — May 2026
slug: sentry-javascript-releases-2026-05
summary: "@sentry/hono goes stable, TanStack Start reaches beta, and a new dataCollection option gives you fine-grained control over what the SDK sends."
categories:
  - SDK
platform:
  - javascript
  - javascript-react
  - javascript-nextjs
  - javascript-vue
  - javascript-angular
  - javascript-svelte
  - javascript-sveltekit
  - javascript-remix
  - javascript-nuxt
  - javascript-astro
  - react-native
  - node
published: false
date: 2026-05-31
author: rahul.chhabria@sentry.io
---

## May 2026 SDK Updates

- **`@sentry/hono` is now stable** — `honoIntegration` is deprecated in favor of the official stable SDK. The `sentry()` middleware now accepts a `shouldHandleError` callback so you can control exactly which errors are captured (by default 3xx/4xx are ignored, 5xx are captured).
- **`@sentry/tanstackstart-react` reaches beta** — distributed tracing now connects server and client traces end-to-end, server transaction names are auto-parametrized (e.g. `GET /users/$userId`), and server function spans now show human-readable names instead of opaque hashes.
- **New `dataCollection` client option** — a centralized way to control what data the SDK collects and sends. Arrays of primitive values (`string`, `number`, `boolean`) are now accepted as span/log/metric attributes; if you scrub attribute values in `beforeSend*` callbacks, [update them to handle arrays](https://github.com/getsentry/sentry-javascript/releases/tag/10.54.0).
- **`streamGenAiSpans` option for AI integrations** — set `streamGenAiSpans: true` to send `gen_ai` spans as v2 envelope items, avoiding payload-size-limit drops when using AI tracing.
- **New `fetchStreamPerformanceIntegration`** — tracks time-to-first-byte and total streaming duration for chunked fetch responses; replaces the now-deprecated `trackFetchStreamPerformance` option.

## Releases Covered

| Release | Date | Summary |
| --- | --- | --- |
| [10.55.0](https://github.com/getsentry/sentry-javascript/releases/tag/10.55.0) | 2026-05-28 | `@sentry/hono` stable, `shouldHandleError` for middleware, TanStack Start distributed tracing |
| [10.54.0](https://github.com/getsentry/sentry-javascript/releases/tag/10.54.0) | 2026-05-26 | Array attributes for spans/logs/metrics, `fetchStreamPerformanceIntegration`, `dataCollection` option |
| [10.53.1](https://github.com/getsentry/sentry-javascript/releases/tag/10.53.1) | 2026-05-12 | Bug fixes: streamed span user data, subpath type shims |
| [10.53.0](https://github.com/getsentry/sentry-javascript/releases/tag/10.53.0) | 2026-05-12 | `streamGenAiSpans` option, Node 26 support, MCP handler retroactive wrapping |
| [10.52.0](https://github.com/getsentry/sentry-javascript/releases/tag/10.52.0) | 2026-05-07 | `@sentry/hono` beta, Cloudflare WorkerEntrypoint tracing, vendored Redis instrumentations |
