---
title: Native (C/C++) SDK Releases — June 2026
slug: 2026-06-native-sdk-releases
summary: In-process app-hang detection, async crash upload mode, improved multi-platform symbolication, and raised module limit.
categories:
  - SDK
platform:
  - native
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **0.15.0 · 0.15.1 · 0.15.2**

| Version | Date | Link |
|---------|------|------|
| 0.15.2 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-native/releases/tag/0.15.2) |
| 0.15.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-native/releases/tag/0.15.1) |
| 0.15.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-native/releases/tag/0.15.0) |

## What changed

- **In-process app-hang detection (0.15.2):** New opt-in `sentry_options_set_enable_app_hang_tracking` monitors a thread via `sentry_app_hang_heartbeat()` and captures a hang event if no heartbeat arrives within `app_hang_timeout` (default 5000 ms).
- **Async crash upload (0.15.0):** Opt-in mode allows the app to exit immediately after capture while a background daemon finishes potentially large uploads.
- **Improved symbolication (0.15.0 · 0.15.2):** Linux crash daemon symbolicates from on-disk ELF tables; macOS crash reports now include full stack traces for all threads; Windows and Crashpad multi-module symbol resolution fixed.
- **Module limit raised (0.15.0):** `SENTRY_CRASH_MAX_MODULES` increased from 512 to 2048, fixing unsymbolicated frames in processes that load many shared libraries.
- **Bug fixes (0.15.1 · 0.15.2):** Fixed partial disk writes for streamed envelopes; Android breadcrumb `data` now sent as structured object; partial disk write detection now reports failure correctly.
