---
title: Dart/Flutter SDK Releases — June 2026
slug: 2026-06-dart-sdk-releases
summary: Android replay trace ID sync, span v2 ingest metadata, and log byte outcome fix.
categories:
  - SDK
platform:
  - dart
  - flutter
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 9.22.0 | 2026-06-11 | [Release notes](https://github.com/getsentry/sentry-dart/releases/tag/9.22.0) |

## TL;DR

- Android replay trace IDs are now synchronised with the native SDK, enabling replay-by-trace lookup across platforms.
- Span v2 envelopes now carry `ingest_settings` metadata for improved server-side processing.
- Fixed missing log byte outcomes that could cause inaccurate data-loss figures on the Sentry Stats page.

## Release notes

### New Features

9.22.0 synchronises replay trace IDs with the native Android SDK on the Flutter/Android layer, so replays captured on Android are correctly associated with traces that originate in Dart. The release also adds `ingest_settings` metadata to span v2 envelopes, which the Sentry ingest pipeline uses for more efficient span routing and processing. Replay IDs are additionally attached to span telemetry.

### Bug Fixes

9.22.0 fixes log byte outcomes not being emitted correctly. These outcomes are how the SDK reports to Sentry the number of log bytes it discarded; incorrect values would have caused inaccurate figures on the Sentry Stats page.
