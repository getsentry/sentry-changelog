---
title: Kotlin Multiplatform SDK Releases — June 2026
slug: 2026-06-kotlin-multiplatform-sdk-releases
summary: Added C++ exception monitoring option for Kotlin Multiplatform targets.
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

Releases covered: **0.27.0**

| Version | Date | Link |
|---------|------|------|
| 0.27.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-kotlin-multiplatform/releases/tag/0.27.0) |

## What changed

- **C++ exception monitoring option (0.27.0):** Added `enableUnhandledCppExceptionMonitoring` to the SDK options. Note: on Apple/Compose Multiplatform targets it's recommended to disable this (`options.enableUnhandledCppExceptionMonitoring = false`) — unhandled Kotlin exceptions from CMP can otherwise be reported as generic `ExceptionObjHolderImpl` C++ crashes instead of useful Kotlin stack traces.
