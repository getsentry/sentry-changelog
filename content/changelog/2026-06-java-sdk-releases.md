---
title: Java SDK Releases — June 2026
slug: 2026-06-java-sdk-releases
summary: Standalone app start tracing, Android 15+ start reason attribution, experimental SQLiteDriver, Session Replay fixes, and significant performance improvements.
categories:
  - SDK
platform:
  - java
  - android
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **8.43.1 · 8.43.2 · 8.43.3 · 8.44.0 · 8.44.1 · 8.45.0 · 8.46.0**

| Version | Date | Link |
|---------|------|------|
| 8.46.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.46.0) |
| 8.45.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.45.0) |
| 8.44.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.44.1) |
| 8.44.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.44.0) |
| 8.43.3 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.43.3) |
| 8.43.2 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.43.2) |
| 8.43.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.43.1) |

## What changed

- **Standalone app start tracing (8.44.0):** New `enableStandaloneAppStartTracing` option sends Android app start as its own transaction (op `app.start`) sharing the same `traceId` as the first `ui.load` transaction, covering activity, broadcast receiver, service, and content provider starts. Opt in via `options.isEnableStandaloneAppStartTracing = true`.
- **Android 15+ start reason (8.45.0):** Standalone app start transactions on API 35+ now include `app.vitals.start.reason` (e.g. `launcher`, `broadcast`, `service`, `content_provider`), searchable in Trace Explorer.
- **Experimental `SentrySQLiteDriver` (8.44.1):** New driver in `sentry-android-sqlite` for instrumenting `androidx.sqlite.SQLiteDriver` (Room/SQLDelight 2.5.0+).
- **Session Replay fixes (8.43.1 · 8.43.2):** Fixed freeze on continuous-animation screens; populated `trace_ids` for replay-by-trace search; fixed `VerifyError` in Compose masking under DexGuard/R8.
- **Performance (8.43.2 · 8.46.0):** Multiple reductions across JSON serialization, scope access, timestamp parsing, breadcrumb allocation, and DSN parsing overhead.
