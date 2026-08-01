---
title: Dart/Flutter SDK Releases — July 2026
slug: 2026-07-dart-sdk-releases
summary: Experimental standalone app start tracing with extend APIs, gRPC integration, stable span streaming, and feature flags on spans.
categories:
  - SDK
platform:
  - dart
  - flutter
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`9.26.0`](https://github.com/getsentry/sentry-dart/releases/tag/9.26.0) (2026-07-30)
- [`9.25.0`](https://github.com/getsentry/sentry-dart/releases/tag/9.25.0) (2026-07-21)
- [`9.24.0`](https://github.com/getsentry/sentry-dart/releases/tag/9.24.0) (2026-07-07)
- [`9.23.0`](https://github.com/getsentry/sentry-dart/releases/tag/9.23.0) (2026-07-02)

## TL;DR

- Experimental standalone app start tracing (`enableStandaloneAppStartTracing`) reports `app.start` as its own root; extend past first frame with `extendAppStart` / `finishExtendedAppStart` (Android + iOS).
- New gRPC integration; span streaming API is non-experimental; span v2 status simplified to ok/error; `blocked_main_thread` reported on streaming spans.
- Feature flags attach to hub spans; array attributes supported on telemetry; Android replay records segment names.
- Rate limits honored for spans and feedback; metric byte outcomes recorded; Android scope sync and replay capture sped up.
- App start screen attribute added; empty delayed-frames `StateError` and Android network breadcrumb Double timestamps fixed.
