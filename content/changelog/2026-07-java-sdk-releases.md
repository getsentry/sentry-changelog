---
title: Java SDK Releases — July 2026
slug: 2026-07-java-sdk-releases
summary: Perfetto continuous profiling on Android API 35+, official Android 17 support, extended app start APIs, OTel BOM, and Session Replay hardening.
categories:
  - SDK
platform:
  - java
  - android
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`8.51.0`](https://github.com/getsentry/sentry-java/releases/tag/8.51.0) (2026-07-29)
- [`8.50.1`](https://github.com/getsentry/sentry-java/releases/tag/8.50.1) (2026-07-23)
- [`8.50.0`](https://github.com/getsentry/sentry-java/releases/tag/8.50.0) (2026-07-22)
- [`8.49.0`](https://github.com/getsentry/sentry-java/releases/tag/8.49.0) (2026-07-16)
- [`8.48.0`](https://github.com/getsentry/sentry-java/releases/tag/8.48.0) (2026-07-08)
- [`8.47.0`](https://github.com/getsentry/sentry-java/releases/tag/8.47.0) (2026-07-02)

## TL;DR

- Continuous profiling on Android API 35+ now uses system `ProfilingManager` (Perfetto) automatically; `enableLegacyProfiling` controls the legacy `Debug` profiler and transaction-based profiling.
- Android 17 is officially supported; AAR `minCompileSdk` is pinned to 21 so apps are not forced to raise `compileSdk` under AGP 9 (8.50.1).
- New `Sentry.extendAppStart()` / `finishExtendedAppStart()` / `getExtendedAppStartSpan()` APIs extend standalone app start past first frame; historical tombstone reporting via manifest meta-data.
- New `io.sentry:sentry-opentelemetry-bom` aligns Sentry OTel modules (including Spring Boot 4.1); Session Replay records segment names and fixes buffer-mode first-segment and error linkage.
- Init and runtime hardening: lazy outbox/cache dirs off the main thread, callback re-entrancy drops instead of `StackOverflowError`, Compose 1.11+ `sentryTag` fix, credential sanitization for JDBC/WebClient, and fewer SDK timer threads.
