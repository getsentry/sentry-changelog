---
title: Unity SDK Releases — July 2026
slug: 2026-07-unity-sdk-releases
summary: Unified EnableAppHangTracking across platforms (incl. Android), Android tombstone options, and C# ANR watchdog deprecated.
categories:
  - SDK
platform:
  - unity
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`4.8.0`](https://github.com/getsentry/sentry-unity/releases/tag/4.8.0) (2026-07-30)
- [`4.7.0`](https://github.com/getsentry/sentry-unity/releases/tag/4.7.0) (2026-07-09)

## TL;DR

- `EnableAppHangTracking` now drives native app-hang tracking on Android, iOS, Linux, macOS, and Windows (default `false`); Android requires `NdkIntegrationEnabled`.
- Legacy C# ANR watchdog options (`AnrDetectionEnabled`, `AnrTimeout`, `DisableAnrIntegration`) are obsolete and default off — migrate to `EnableAppHangTracking`.
- App hang detection pauses/resumes on background/foreground to cut false positives.
- Android tombstone options: `AndroidNativeTombstoneEnabled` and `AndroidReportHistoricalTombstones` (default off) for `ApplicationExitInfo` native crashes.
- Native environment sync from Scope; iOS/macOS native support moved to Obj-C sentry-cocoa flavour; Metrics API `ReadOnlySpan` dependency resolution fix from 4.6.0.
