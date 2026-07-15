---
title: Native (C/C++) SDK Releases — June 2026
slug: 2026-06-native-sdk-releases
summary: In-process app-hang detection, async crash upload, improved multi-platform symbolication, and raised module limit.
categories:
  - SDK
platform:
  - native
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 0.15.2 | 2026-06-23 | [Release notes](https://github.com/getsentry/sentry-native/releases/tag/0.15.2) |
| 0.15.1 | 2026-06-18 | [Release notes](https://github.com/getsentry/sentry-native/releases/tag/0.15.1) |
| 0.15.0 | 2026-06-11 | [Release notes](https://github.com/getsentry/sentry-native/releases/tag/0.15.0) |

## TL;DR

- New in-process app-hang monitor via `sentry_options_set_enable_app_hang_tracking` + `sentry_app_hang_heartbeat()`.
- Opt-in async crash upload lets the app exit immediately after capture; a daemon finishes the upload in the background.
- Improved symbolication on Linux (ELF), macOS (full thread stacks), and for Windows/Crashpad multi-module apps.
- `SENTRY_CRASH_MAX_MODULES` raised from 512 to 2048.
- Fixed partial disk writes for streamed envelopes; Android breadcrumb `data` now sent as structured object.

## Release notes

### Breaking Changes

0.15.0 changes two function signatures. `sentry_value_incref` now returns `sentry_value_t` (the value itself, enabling chaining), and `sentry_value_decref` now returns `int` (0 if the value was freed, non-zero otherwise). Callers that previously ignored the return values are unaffected; callers that assigned the result of `sentry_value_decref` to a variable need to update their type declarations.

### New Features

0.15.2 introduces an in-process app-hang monitor. Enable it via `sentry_options_set_enable_app_hang_tracking`. A background thread then watches for periodic calls to `sentry_app_hang_heartbeat()` from the thread you want monitored; if no heartbeat arrives within `app_hang_timeout` milliseconds (default 5000), it captures an app-hang event including a stack trace.

0.15.0 adds an opt-in async crash upload mode. When active, the crashed process exits immediately after the crash data is written to disk, and the `sentry-native` crash daemon picks up and uploads the report in the background. This is useful when post-crash upload latency — which can be significant for large apps — is unacceptable. A `transfer_timeout` option for SDK-managed HTTP transports is also new in this release.

Symbolication improved substantially. On Linux, the crash daemon now symbolicates stack frames from on-disk ELF symbol tables, so the crashing thread's frames are resolved without ptrace. On macOS, crash reports now include full stack traces for all threads — previously non-crashing threads showed only a single frame — and macOS and Linux builds now include thread names. 0.15.2 fixes symbol resolution for crashes in multi-module applications on both the Windows inproc backend and Crashpad.

`SENTRY_CRASH_MAX_MODULES` has been raised from 512 to 2048 in 0.15.0. Processes that load many shared libraries could previously have their minidump module list silently truncated, leaving frames without a `debug_id` and making them unsymbolicatable in Sentry.

### Bug Fixes

0.15.1 fixes the SDK silently treating partial disk writes during streamed envelope persistence as success. Partial writes are now detected and reported as failures. Also in 0.15.1, Android breadcrumb `data` was serialised and sent as a raw JSON string rather than a structured object; it is now sent correctly.

0.15.0 fixes the macOS `image_size` field in crash minidumps, which was computed incorrectly and could cause the symbolicator to attribute every frame to the lowest-addressed image — typically `dyld` or `libsystem`. Active traces are now also finished at crash time so the trace context is attached to the crash event.
