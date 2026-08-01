---
title: Cocoa SDK Releases — July 2026
slug: 2026-07-cocoa-sdk-releases
summary: Memory introspection off by default, category-scoped rate limits, feature flags on spans, stable swiftAsyncStacktraces, and Session Replay/network hardening.
categories:
  - SDK
platform:
  - apple-ios
  - apple-macos
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`9.24.0`](https://github.com/getsentry/sentry-cocoa/releases/tag/9.24.0) (2026-07-30)
- [`9.23.0`](https://github.com/getsentry/sentry-cocoa/releases/tag/9.23.0) (2026-07-22)
- [`9.22.0`](https://github.com/getsentry/sentry-cocoa/releases/tag/9.22.0) (2026-07-15)
- [`9.21.0`](https://github.com/getsentry/sentry-cocoa/releases/tag/9.21.0) (2026-07-08)
- [`9.20.0`](https://github.com/getsentry/sentry-cocoa/releases/tag/9.20.0) (2026-07-06)
- [`9.19.1`](https://github.com/getsentry/sentry-cocoa/releases/tag/9.19.1) (2026-07-01)
- [`8.58.4`](https://github.com/getsentry/sentry-cocoa/releases/tag/8.58.4) (2026-07-07)

## TL;DR

- `enableMemoryIntrospection` now defaults to `false` (was on) to reduce PII risk in crash stack contents near the crash site — re-enable explicitly if needed (9.24.0).
- Rate limits are category-scoped: a limit on one data type no longer drops spans/sessions/other categories (9.20.0 and 8.58.4 backport).
- Feature flags: scope APIs, attach evaluations to active spans, and clear flags; `swiftAsyncStacktraces` is stable; experimental `dataCollection` for scrubbing control.
- Session Replay: HTTP/2/3 `Content-Type` body capture, Core Animation redact crash fixed, network detail capture auto-enables when `networkDetailAllowUrls` is set.
- Security/reliability: UI breadcrumb x/y coords removed, hybrid screenshot capture restored, view-hierarchy depth limit, environment persisted in crash reports, use-after-free and C++ exception capture fixes.
