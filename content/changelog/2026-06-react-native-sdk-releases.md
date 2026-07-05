---
title: React Native SDK Releases — June 2026
slug: 2026-06-react-native-sdk-releases
summary: Expo Router error boundary capture, deep link correlation, Mobile Session Replay network details, and Android profiling improvements.
categories:
  - SDK
platform:
  - react-native
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **8.14.0 · 8.14.1 · 8.15.0 · 8.15.1 · 8.16.0**

| Version | Date | Link |
|---------|------|------|
| 8.16.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.16.0) |
| 8.15.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.15.1) |
| 8.15.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.15.0) |
| 8.14.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.14.1) |
| 8.14.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.14.0) |

## What changed

- **Expo Router error boundary capture (8.16.0):** Wrap routes with `Sentry.wrapExpoRouterErrorBoundary` to capture render-phase errors with route context (`route.name`, `route.path`, `route.params`) and tag the in-flight navigation transaction as errored.
- **Deep link correlation (8.14.0):** Deep links are now correlated with the resulting navigation transaction — tagged with `navigation.trigger: 'deeplink'`, `deeplink.url`, and `deeplink.dispatch_delay_ms`. Covers both cold start and warm open paths.
- **Mobile Session Replay network details (8.15.0):** XHR request/response headers and bodies can now be captured via `networkDetailAllowUrls` and `networkCaptureBodies: true`. Authorization headers are always stripped; bodies capped at ~150 KB.
- **Profiling & linked errors (8.14.0 · 8.15.0):** Added memory, CPU, and frame measurements to Android profiling; JVM stack traces of rejected native module promises now captured as linked exceptions via `nativeStackAndroid`.
- **Bug fixes (8.15.1 · 8.16.0):** Fixed fatal iOS crash in `RNSentryReplayBreadcrumbConverter`; fixed Android `ClassCastException` with numeric breadcrumb timestamps; fixed Android Gradle source map upload being silently skipped.

_Tagged by @rahulchhabria_
