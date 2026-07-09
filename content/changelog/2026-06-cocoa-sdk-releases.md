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

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 9.19.0 | 2026-06-24 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.19.0) |
| 9.18.0 | 2026-06-18 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.18.0) |
| 9.17.1 | 2026-06-11 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.17.1) |
| 9.17.0 | 2026-06-10 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.17.0) |
| 9.16.1 | 2026-06-03 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.16.1) |
| 9.16.0 | 2026-06-03 | [Release notes](https://github.com/getsentry/sentry-cocoa/releases/tag/9.16.0) |

## TL;DR

- New `SentryObjC` wrapper SDK for ObjC++ projects that can't enable Clang modules — ships as SPM product and precompiled `.xcframework` bundles.
- Overhauled User Feedback APIs: `SentrySDK.feedback.show()`, `SentrySDK.FeedbackForm`, `.sentryFeedback(isPresented:)`, per-form config closures; deprecated managed custom button (removed in v10).
- Extended app start APIs renamed (`extendAppStart`, `finishExtendedAppStart`); app start sub-span operations renamed for clarity.
- Session Replay reduced capture stutters; video assembly drops empty segments and avoids frame duplication at boundaries.
- Fixed concurrent breadcrumb mutation crash, iOS 26 `SentryFramesTracker` crash, and feedback form appearing on external displays.

## Release notes

### New Features

9.16.0 introduces a new `SentryObjC` wrapper SDK providing a pure Objective-C interface for projects that cannot enable Clang modules — for example Objective-C++ files compiled with `-fmodules=NO`. It ships as an SPM source product and precompiled static and dynamic `.xcframework` bundles. To migrate: replace the `Sentry` or `SentrySPM` dependency with `SentryObjC`, change the import header to `#import <SentryObjC/SentryObjC.h>`, and rename `Sentry`-prefixed types to their `SentryObjC` equivalents (e.g. `SentrySDK` → `SentryObjCSDK`). Note: the 9.16.0 SPM release had an incorrect checksum for the static target; 9.16.1 re-releases the same code with the corrected checksum.

9.17.0 introduces managed User Feedback presentation APIs. Call `SentrySDK.feedback.show()` to present the form using the best available presenter, use `SentrySDK.FeedbackForm()` in UIKit or `.sentryFeedback(isPresented:)` in SwiftUI to present it yourself, or embed `SentrySDK.FeedbackFormView()` in a sheet. All presentation paths accept an optional configuration closure, allowing per-invocation customisation on top of the global `SentryOptions.configureUserFeedback` settings without mutating them. 9.18.0 adds equivalent presentation APIs and a `UIViewController`-returning form factory via `SentryObjC`.

9.19.0 renames the extended app start API: `extendAppLaunch()` becomes `extendAppStart()`, `finishExtendedAppLaunch()` becomes `finishExtendedAppStart()`, and `getExtendedAppStartSpan()` is added to retrieve the current span. App start sub-span operations are also renamed for consistency: `app.start.pre_runtime_init`, `app.start.runtime_init`, `app.start.uikit_init`, `app.start.application_init`, and `app.start.extended_app_start`.

### Deprecations

9.18.0 deprecates the managed User Feedback custom button, which will be removed in v10. Present the feedback form from your own code using `SentrySDK.feedback.show()`, `SentrySDK.FeedbackForm`, or `.sentryFeedback(isPresented:)` instead.

### Bug Fixes

9.19.0 fixes a crash triggered by modifying breadcrumbs from multiple threads simultaneously — thread safety is now enforced internally. Also in 9.19.0: the feedback form no longer appears on external displays, it remains active after dismissal rather than deactivating, and Session Replay video assembly no longer produces empty segments or duplicates frames at segment boundaries. Capture stutters are reduced by scheduling screenshots after run-loop UI work completes rather than from display-refresh callbacks.

9.17.1 ships dSYMs in the `SentryObjC-Dynamic.xcframework` artifacts and fixes missing `_OBJC_CLASS_$_` symbols in the x86_64 slice of the static framework.
