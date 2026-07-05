---
title: Dart/Flutter SDK Releases — June 2026
slug: 2026-06-dart-sdk-releases
summary: Android replay trace ID sync, span v2 ingest metadata, and log byte outcome fixes.
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

Releases covered: **9.22.0**

| Version | Date | Link |
|---------|------|------|
| 9.22.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-dart/releases/tag/9.22.0) |

## What changed

- **Android replay trace ID sync (9.22.0):** Replay trace IDs are now synchronized on Android, enabling replay-by-trace lookup across platforms.
- **Span v2 envelope metadata (9.22.0):** Added `ingest_settings` metadata to span v2 envelopes for improved server-side processing.
- **Bug fix (9.22.0):** Fixed missing log byte outcomes that could cause incorrect data-discarded reporting.
