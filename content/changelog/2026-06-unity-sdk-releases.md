---
title: Unity SDK Releases — June 2026
slug: 2026-06-unity-sdk-releases
summary: App hang tracking, Android ANR detection, experimental sentry-native backend on macOS/Windows/Linux, and .NET Standard 2.1 support.
categories:
  - SDK
platform:
  - unity
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **4.4.0 · 4.5.0 · 4.6.0**

| Version | Date | Link |
|---------|------|------|
| 4.6.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-unity/releases/tag/4.6.0) |
| 4.5.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-unity/releases/tag/4.5.0) |
| 4.4.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-unity/releases/tag/4.4.0) |

## What changed

- **App hang tracking (4.4.0 · 4.6.0):** `EnableAppHangTracking` (default `true`) and `AppHangTimeout` (default `5s`) added. On iOS, uses Cocoa's native monitor; on macOS/Windows/Linux, opt in via `options.Experimental.EnableNativeAppHangTracking` (powered by `sentry-native`).
- **Android ANR detection (4.4.0):** `AndroidNativeAnrEnabled` (default `true`) enables native ANR detection via `sentry-java` — ANR v2 on API ≥ 30, in-process watchdog on older API levels.
- **Experimental sentry-native backend (4.4.0 · 4.5.0):** Extended to macOS, Windows, and Linux for immediate crash upload via an out-of-process crash handler. Opt in per platform via `options.Experimental.*Backend = *Backend.Native`.
- **.NET Standard 2.1 support (4.6.0):** SDK now supports .NET Standard 2.1 for both source builds and the Unity Player Settings Api Compatibility Level.
- **Bug fixes (4.5.0):** Breadcrumb data now synced to native layer; fixed Android debug symbol upload on Unity 6.4 using Gradle's `Exec` task type.
