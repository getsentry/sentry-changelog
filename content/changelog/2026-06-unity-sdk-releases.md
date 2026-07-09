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

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 4.6.0 | 2026-06-26 | [Release notes](https://github.com/getsentry/sentry-unity/releases/tag/4.6.0) |
| 4.5.0 | 2026-06-19 | [Release notes](https://github.com/getsentry/sentry-unity/releases/tag/4.5.0) |
| 4.4.0 | 2026-06-05 | [Release notes](https://github.com/getsentry/sentry-unity/releases/tag/4.4.0) |

## TL;DR

- App hang tracking (`EnableAppHangTracking`, default `true`) — iOS via Cocoa's native monitor; macOS/Windows/Linux via experimental `options.Experimental.EnableNativeAppHangTracking`.
- Android ANR detection via `sentry-java` (`AndroidNativeAnrEnabled`, default `true`) — ANR v2 on API ≥ 30, in-process watchdog below.
- Experimental `sentry-native` crash backend extended to macOS, Windows, and Linux for immediate out-of-process crash upload.
- .NET Standard 2.1 support for Player Settings Api Compatibility Level.
- Breadcrumb data now synced to native layer; Android debug symbol upload fixed on Unity 6.4.

## Release notes

### New Features

4.4.0 introduces two new runtime monitoring features. `EnableAppHangTracking` (default `true`) and `AppHangTimeout` (default 5 s) are added to `SentryUnityOptions`. On iOS the Cocoa SDK's native main-thread monitor is used; when active on iOS, the Unity C# watchdog is automatically disabled to avoid duplicate reports. `AndroidNativeAnrEnabled` (default `true`) enables Android ANR detection through the Java SDK — on API ≥ 30, ANR v2 via `ApplicationExitInfo` reports OS-detected ANRs from prior runs; on lower API levels an in-process watchdog is used. This operates alongside the Unity C# watchdog, which monitors the player loop independently.

Also in 4.4.0, an experimental `sentry-native` crash backend is available on macOS and Windows. Opt in via `options.Experimental.MacosBackend = MacosBackend.Native` or `options.Experimental.WindowsBackend = WindowsBackend.Native`. Unlike the Cocoa and Breakpad backends, `sentry-native` uploads crashes immediately through an out-of-process crash handler, which avoids the re-launch required by on-disk-queue approaches.

4.5.0 extends the experimental `sentry-native` backend to Linux (opt in via `options.Experimental.LinuxBackend = LinuxBackend.Native`).

4.6.0 adds `options.Experimental.EnableNativeAppHangTracking` (default `false`) which enables app hang detection via `sentry-native` on macOS, Windows, and Linux. When effective, the Unity C# watchdog is skipped. iOS hang tracking remains controlled by the top-level `EnableAppHangTracking`. 4.6.0 also adds .NET Standard 2.1 support — the SDK now builds targeting .NET Standard 2.1 and the Unity Player Settings "Api Compatibility Level" can be set accordingly. To avoid build-time dependency ambiguity, `System.Buffers`, `System.Memory`, `System.Numerics.Vectors`, and `System.Threading.Tasks.Extensions` are no longer deep-renamed inside the SDK assembly, allowing the Unity build pipeline to resolve them from its own runtime.

### Bug Fixes

4.5.0 fixes breadcrumb `data` not being synced to the native layer. Native crash events (on iOS and Android) were missing breadcrumbs added on the C# side; they are now forwarded correctly.

4.4.0 fixes a crash in `urlSessionTask:setState:` when an `AVAssetDownloadTask` was in-flight on iOS, and fixes Android debug symbol upload failing on Unity 6.4 where the SDK was using a deprecated Gradle task type — it now uses Gradle's built-in `Exec` type.

4.5.0 also removes `Lumin` and `Stadia` from the SDK's assembly definition, which was causing compilation errors on those platforms.
