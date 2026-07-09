---
title: Kotlin Multiplatform SDK Releases — June 2026
slug: 2026-06-kotlin-multiplatform-sdk-releases
summary: Added C++ exception monitoring option with a caveat for Compose Multiplatform targets.
categories:
  - SDK
platform:
  - kotlin
  - android
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 0.27.0 | 2026-06-03 | [Release notes](https://github.com/getsentry/sentry-kotlin-multiplatform/releases/tag/0.27.0) |

## TL;DR

- New `enableUnhandledCppExceptionMonitoring` option — on Apple/Compose Multiplatform targets it is strongly recommended to disable it to avoid Kotlin exceptions being misreported as generic C++ crashes.

## Release notes

### New Features

0.27.0 adds an `enableUnhandledCppExceptionMonitoring` option that mirrors the same option available in the Cocoa SDK. When enabled, the native crash handler also watches for unhandled C++ exceptions. On Apple targets used with Compose Multiplatform, disabling this option (`options.enableUnhandledCppExceptionMonitoring = false`) is strongly recommended: Kotlin exceptions from CMP can propagate as C++ exceptions at the native boundary, and with the monitor active they may appear in Sentry as generic `ExceptionObjHolderImpl` crashes rather than readable Kotlin stack traces.
