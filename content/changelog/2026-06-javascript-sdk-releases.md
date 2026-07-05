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

Releases covered: **10.56.0 · 10.57.0 · 10.58.0 · 10.59.0 · 10.60.0 · 10.61.0 · 10.62.0**

| Version | Date | Link |
|---------|------|------|
| 10.62.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.62.0) |
| 10.61.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.61.0) |
| 10.60.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.60.0) |
| 10.59.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.59.0) |
| 10.58.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.58.0) |
| 10.57.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.57.0) |
| 10.56.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.56.0) |

## What changed

- **gen_ai span streaming on by default (10.61.0):** `streamGenAiSpans` is now enabled by default — `gen_ai` spans stream as v2 envelope items, preventing drops and disabling default message truncation. Self-hosted users can opt out with `streamGenAiSpans: false`.
- **Expanded Cloudflare instrumentation (10.60.0 · 10.61.0):** R2 buckets, D1 batch/exec/withSession, SQLite Durable Objects SQL API, and sync KV are all now auto-instrumented.
- **New integrations & runtime support (10.59.0 · 10.62.0):** `vercelAiIntegration` adds Vercel AI SDK v7 support; AWS SDK clients ≥ 3.1046.0 are auto-instrumented; Bun and Deno get orchestrion runtime hooks.
- **New APIs (10.61.0):** Top-level `Sentry.setAttribute(s)` APIs added; Hono transactions now named after matched route handlers; `bindScopeToEmitter` added for event-emitter-scoped traces.
- **Bug fixes (10.57.0 · 10.58.0):** React Router v6/v7 navigation detection moved to layout effect for correct trace propagation; PostgresJS no longer emits duplicate spans per query; Next.js redirects no longer reported as `internal_error`.

_Tagged by @rahulchhabria_
