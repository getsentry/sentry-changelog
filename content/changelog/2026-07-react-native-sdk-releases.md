---
title: React Native SDK Releases — July 2026
slug: 2026-07-react-native-sdk-releases
summary: TurboModule performance attribution, standalone app start + extend APIs, Expo Updates timing spans, and iOS screenshot restore.
categories:
  - SDK
platform:
  - react-native
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`8.21.0`](https://github.com/getsentry/sentry-react-native/releases/tag/8.21.0) (2026-07-30)
- [`8.20.0`](https://github.com/getsentry/sentry-react-native/releases/tag/8.20.0) (2026-07-23)
- [`8.19.0`](https://github.com/getsentry/sentry-react-native/releases/tag/8.19.0) (2026-07-16)
- [`8.18.0`](https://github.com/getsentry/sentry-react-native/releases/tag/8.18.0) (2026-07-09)
- [`8.17.2`](https://github.com/getsentry/sentry-react-native/releases/tag/8.17.2) (2026-07-06)
- [`8.17.1`](https://github.com/getsentry/sentry-react-native/releases/tag/8.17.1) (2026-07-03)
- [`8.17.0`](https://github.com/getsentry/sentry-react-native/releases/tag/8.17.0) (2026-07-02)
- [`8.14.2`](https://github.com/getsentry/sentry-react-native/releases/tag/8.14.2) (2026-07-16)

## TL;DR

- TurboModule tracking: per-(module, method) span attributes and slow-call breadcrumbs (8.21), plus aggregate stats on transaction finish (8.19); opt-in via `enableTurboModuleTracking` / `turboModuleContextIntegration`.
- Standalone app start tracing (`enableStandaloneAppStartTracing`) and experimental `extendAppStart` / `finishExtendedAppStart` for post-init startup work; `Sentry.reportFullyDisplayed()` for TTFD.
- Expo Updates listener adds check/download timing spans; Session Replay network details capture `fetch` bodies; `networkCaptureBodies` defaults to true.
- iOS screenshots restored in 8.20.0 (broken in 8.19.0); prefer ≥8.20.0. Cocoa consumed as prebuilt xcframework by default (set `SENTRY_USE_XCFRAMEWORK=0` to build from source).
- Navigation fixes for Expo Router cold start / `withAnchor` duplicates and stale route names; Android New Architecture 16 KB page-size and link fixes in 8.17.x — use ≥8.17.2.
