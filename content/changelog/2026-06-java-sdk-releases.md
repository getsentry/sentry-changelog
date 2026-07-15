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
published: true
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 8.46.0 | 2026-06-25 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.46.0) |
| 8.45.0 | 2026-06-24 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.45.0) |
| 8.43.3 | 2026-06-24 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.43.3) |
| 8.44.1 | 2026-06-19 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.44.1) |
| 8.44.0 | 2026-06-17 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.44.0) |
| 8.43.2 | 2026-06-10 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.43.2) |
| 8.43.1 | 2026-06-03 | [Release notes](https://github.com/getsentry/sentry-java/releases/tag/8.43.1) |

## TL;DR

- New `enableStandaloneAppStartTracing` option sends Android app start as its own transaction (op `app.start`), linked to the first `ui.load` via shared `traceId`; covers all start paths. Disabled by default.
- Android 15+ (API 35) app start transactions now include `app.vitals.start.reason` (e.g. `launcher`, `broadcast`) — searchable in Trace Explorer.
- Experimental `SentrySQLiteDriver` in `sentry-android-sqlite` for instrumenting `androidx.sqlite.SQLiteDriver` (Room/SQLDelight 2.5.0+).
- Session Replay: fixed freeze on continuous-animation screens, trace_id search, and DexGuard/R8 Compose masking.
- Multiple serialization, scope, and timestamp performance improvements across 8.43.2 and 8.46.0.

## Release notes

### New Features

8.44.0 introduces standalone app start tracing for Android. Setting `options.isEnableStandaloneAppStartTracing = true` (or the manifest key `io.sentry.standalone-app-start-tracing.enable`) sends the app start as its own transaction with op `app.start`. The transaction carries the same `traceId` as the first `ui.load` activity transaction, keeping both linked in the trace view. Non-activity starts — broadcast receivers, services, and content providers — are covered too.

8.44.1 adds an experimental `SentrySQLiteDriver` to `sentry-android-sqlite`. It wraps any `androidx.sqlite.SQLiteDriver` — as provided by Room or SQLDelight 2.5.0+ — and produces spans for every query.

8.45.0 enriches standalone app start transactions on Android 15+ (API 35). The `app.vitals.start.reason` trace attribute is derived from `ApplicationStartInfo.getReason()` and includes values such as `launcher`, `broadcast`, `service`, and `content_provider`. The attribute is queryable and groupable in the Trace Explorer.

### Performance

8.43.2 and 8.46.0 contain a sustained effort to reduce SDK overhead across several hot paths. JSON serialization improvements include a smaller initial `JsonWriter` nesting stack with on-demand growth, on-demand reflection cycle tracking, lazy reflection serializer instantiation, and array-based key sorting in context serialization. Timestamp handling now avoids unnecessary `Calendar` construction and uses a custom ISO-8601 formatter. Scope access gained an early-return path in `CombinedScopeView` when only one scope has data, and defensive `Date` copies in SDK data model getters are removed. Breadcrumb creation defers the internal data map until data is actually added, and SDK initialisation replaces `java.net.URI` with a lightweight string parser for DSN parsing.

### Behavioral Changes

As a consequence of the performance work in 8.46.0, collections returned by scope getters (`getBreadcrumbs`, `getTags`, `getAttachments`) and `Date` objects returned by data model getters are now shared state and must not be mutated by callers. Previously `CombinedScopeView` returned defensive copies for some collections; those copies are removed.

### Bug Fixes

8.43.1 fixes a Session Replay recording freeze that occurred on screens with continuous animations. The same release adds `trace_ids` to replay events, enabling searching for replays by trace ID in Sentry.

8.43.2 fixes two Compose masking issues under DexGuard/R8 obfuscation: a `VerifyError` when the masking bytecode was processed, and a silent failure where masking simply did nothing on obfuscated/minified builds.

8.44.0 fixes duplicate native attachments being included in events that already carried scope attachments, and fixes the performance collector scheduling an excessive number of tasks in quick succession.

8.44.1 fixes a `FirstDrawDoneListener` leak — each registration was leaving an `OnGlobalLayoutListener` in place even after it fired.

8.45.0 fixes incorrect cron check-in durations when the system wall clock was adjusted mid-flight (duration is now measured with `System.nanoTime()`), and a crash when `getHistoricalProcessStartReasons` was called from an isolated or wrong-userId process. A `MediaMuxer` resource leak in Session Replay when a segment contained no encodable frames is also fixed.
