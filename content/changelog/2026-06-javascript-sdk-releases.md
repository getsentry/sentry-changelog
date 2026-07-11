---
title: JavaScript SDK Releases — June 2026
slug: 2026-06-javascript-sdk-releases
summary: gen_ai span streaming enabled by default, expanded Cloudflare instrumentation, Vercel AI SDK v7 support, and new top-level Sentry APIs.
categories:
  - SDK
platform:
  - javascript
  - node
  - react-native
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 10.62.0 | 2026-06-26 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.62.0) |
| 10.61.0 | 2026-06-25 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.61.0) |
| 10.60.0 | 2026-06-23 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.60.0) |
| 10.59.0 | 2026-06-19 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.59.0) |
| 10.58.0 | 2026-06-15 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.58.0) |
| 10.57.0 | 2026-06-09 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.57.0) |
| 10.56.0 | 2026-06-02 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.56.0) |

## TL;DR

- `streamGenAiSpans` is now enabled by default — `gen_ai` spans are sent as v2 envelope items, preventing size limit drops and disabling default message truncation; self-hosted users can opt out with `streamGenAiSpans: false`.
- Expanded Cloudflare instrumentation: R2 buckets, D1 batch/exec/withSession, SQLite Durable Objects SQL API, and sync KV are all now auto-instrumented.
- `vercelAiIntegration` adds Vercel AI SDK v7 support
- New top-level `Sentry.setAttribute(s)` APIs; Hono transactions named after matched route handlers
- React Router v6/v7 navigation tracing fix; PostgresJS duplicate span fix; Next.js redirect classification fix.

## Release notes

### New Features

10.61.0 enables `streamGenAiSpans` by default. `gen_ai` spans are extracted from transactions and sent as v2 envelope items, which means they can no longer be dropped when the transaction payload exceeds size limits, and AI message data is no longer truncated by default. Pass `enableTruncation: true` on the respective AI integration to re-enable truncation. Self-hosted Sentry users should set `streamGenAiSpans: false` until their instance supports streamed spans.

Cloudflare storage instrumentation expanded across three releases: 10.60.0 added R2 bucket auto-instrumentation, 10.61.0 added D1 batch operations, `exec()`, and `withSession()`, as well as SQL API instrumentation for SQLite Durable Objects. 10.59.0 added synchronous KV instrumentation. Together these give complete zero-config coverage for Cloudflare storage primitives.

10.62.0 extends `vercelAiIntegration` to support v7 of the Vercel AI SDK (note: not yet available on Cloudflare Workers).

10.61.0 adds two new top-level APIs — `Sentry.setAttribute(key, value)` and `Sentry.setAttributes(attributes)` — for setting custom attributes on the currently active span without a direct span reference. Hono transactions are now named after the matched route handler.

### Bug Fixes

10.57.0 moves React Router v6/v7 navigation detection from a regular effect to a layout effect. This ensures the correct parent trace is present when the navigation span is created, closing trace propagation gaps visible in distributed traces.

Also in 10.57.0, the PostgresJS integration was emitting a duplicate span for every query due to a listener registration bug. Only one span is now created per query.

In 10.58.0, Next.js server actions that perform redirects were incorrectly classified as `internal_error`. They are now reported as `ok`.

10.56.0 fixes `instrumentDurableObjectWithSentry` accidentally breaking Cloudflare Agents when applied to Durable Objects that use the Agents SDK.

10.62.0 makes the SDK resilient to runtimes where `tracingChannel` is not available (Node < 22), instead of throwing at runtime.
