---
title: Cocoa SDK Releases — June 2026
slug: 2026-06-cocoa-sdk-releases
summary: New SentryObjC wrapper SDK, overhauled User Feedback APIs, extended app start instrumentation, and Session Replay improvements.
categories:
  - SDK
platform:
  - apple-ios
  - apple-macos
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **9.16.0 · 9.16.1 · 9.17.0 · 9.17.1 · 9.18.0 · 9.19.0**

| Version | Date | Link |
|---------|------|------|
| 9.19.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.19.0) |
| 9.18.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.18.0) |
| 9.17.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.17.1) |
| 9.17.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.17.0) |
| 9.16.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.16.1) |
| 9.16.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.16.0) |

## What changed

- **SentryObjC wrapper SDK (9.16.0):** New pure Objective-C interface for projects that can't enable Clang modules (e.g. ObjC++ with `-fmodules=NO`) — ships as an SPM product and precompiled `.xcframework` bundles.
- **User Feedback APIs overhauled (9.17.0 · 9.18.0):** New managed presentation APIs including `SentrySDK.feedback.show()`, `SentrySDK.FeedbackForm`, `.sentryFeedback(isPresented:)`, and per-form configuration closures. The managed custom button is deprecated and will be removed in v10.
- **Extended app start instrumentation (9.19.0):** `extendAppLaunch()` → `extendAppStart()` / `finishExtendedAppLaunch()` → `finishExtendedAppStart()`; app start sub-span operations renamed for clarity (e.g. `app.start.pre_runtime_init`, `app.start.uikit_init`).
- **Session Replay improvements (9.19.0):** Reduced capture stutters by scheduling screenshots after run-loop UI work; video assembly drops empty segments and avoids frame duplication at segment boundaries.
- **Bug fixes (9.19.0):** Fixed crash from concurrent breadcrumb mutations; prevented feedback form appearing on external displays; fixed iOS 26 crash in `SentryFramesTracker`.

_Tagged by @rahulchhabria_
