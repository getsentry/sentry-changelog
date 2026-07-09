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

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 8.16.0 | 2026-06-25 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.16.0) |
| 8.15.1 | 2026-06-19 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.15.1) |
| 8.15.0 | 2026-06-18 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.15.0) |
| 8.14.1 | 2026-06-24 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.14.1) |
| 8.14.0 | 2026-06-11 | [Release notes](https://github.com/getsentry/sentry-react-native/releases/tag/8.14.0) |

## TL;DR

- Expo Router per-route `ErrorBoundary` errors now captured with route context via `Sentry.wrapExpoRouterErrorBoundary`.
- Deep links correlated with resulting navigation transactions, tagged with trigger, URL, and dispatch delay.
- Mobile Session Replay network details: XHR headers/bodies capturable via `networkDetailAllowUrls` + `networkCaptureBodies`.
- Android profiling gains memory, CPU, and frame measurements; JVM stack traces of rejected native module promises captured as linked errors.
- Fixed fatal iOS crash in `RNSentryReplayBreadcrumbConverter`; Android Gradle source map upload fix; Android `ClassCastException` with numeric breadcrumb timestamps.

## Release notes

### New Features

8.14.0 adds deep link correlation. When a deep link arrives — at cold start via `Linking.getInitialURL()` or as a warm open via the `'url'` event — the next idle navigation span started within `routeChangeTimeoutMs` is tagged with `navigation.trigger: 'deeplink'`, `deeplink.url` (sanitised; the concrete URL requires `sendDefaultPii`), and `deeplink.dispatch_delay_ms`. Both cold-start and warm-open paths are covered, including the late-arrival case where Expo Router auto-handles the URL before the `getInitialURL()` chain resolves.

Also in 8.14.0: memory, CPU, and frame measurements are now included in Android continuous profiling sessions. When a React Native module's native implementation rejects a promise, the JVM stack trace is captured as a linked exception via `nativeStackAndroid`. Expo Router `push`, `replace`, `navigate`, `back`, and `dismiss` calls are instrumented with breadcrumbs and spans; the resulting navigation span is tagged with `navigation.method`. Attributes that may contain user identifiers — `route.href`, `route.params`, and concrete pathnames — are gated behind `sendDefaultPii`.

8.15.0 enables network request and response header capture — and optionally body capture — in Mobile Session Replay for XHR-based clients such as axios. Configure it on `mobileReplayIntegration` with `networkDetailAllowUrls` to enable header capture; add `networkCaptureBodies: true` to also capture bodies. Authorization-like headers are always stripped, bodies are capped at approximately 150 KB, and URLs not matched by `networkDetailAllowUrls` are not captured. Fetch support will follow in a future release.

8.16.0 lets Expo Router per-route error boundaries be wrapped with `Sentry.wrapExpoRouterErrorBoundary(ExpoErrorBoundary)` to capture render-phase errors. The SDK attaches route context (`route.name`, `route.path`, `route.params`) to the captured event, tags the in-flight navigation transaction as errored, and emits a breadcrumb. Concrete paths and params are gated behind `sendDefaultPii`.

### Bug Fixes

8.15.1 and 8.14.1 fix Android Gradle source map upload being silently skipped in some build configurations.

8.15.0 fixes an Android `ClassCastException` thrown when syncing breadcrumbs with a numeric (non-string) `timestamp` field to the native scope.

8.16.0 fixes a fatal `NSInvalidArgumentException` crash in `RNSentryReplayBreadcrumbConverter` when a touch breadcrumb's path array contained a non-dictionary element such as `NSNull`. Also in 8.16.0: `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, and `SENTRY_DIST` environment variables now apply to the JavaScript bundle options, preventing the native and JS layers from disagreeing on release or environment. User `geo` data was being dropped from the native scope because it was forwarded as a JSON string instead of a structured object — this is now fixed.
