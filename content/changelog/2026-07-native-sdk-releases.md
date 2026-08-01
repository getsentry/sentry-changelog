---
title: Native (C/C++) SDK Releases — July 2026
slug: 2026-07-native-sdk-releases
summary: Reusable scopes with attributes, Windows WER integration, app-hang pause, richer user feedback, and crash-path reliability fixes.
categories:
  - SDK
platform:
  - native
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`0.16.1`](https://github.com/getsentry/sentry-native/releases/tag/0.16.1) (2026-07-30)
- [`0.16.0`](https://github.com/getsentry/sentry-native/releases/tag/0.16.0) (2026-07-27)
- [`0.15.4`](https://github.com/getsentry/sentry-native/releases/tag/0.15.4) (2026-07-21)
- [`0.15.3`](https://github.com/getsentry/sentry-native/releases/tag/0.15.3) (2026-07-06)

## TL;DR

- Reusable user-owned scopes (`sentry_scope_new` / `clone` / `free`) with attributes, `sentry_scope_capture_*` for events/logs/metrics/feedback, and `sentry_transaction_discard` / `sentry_span_discard`.
- Windows: WER integration for tags/attachments, `minidump_flags` option, heap-corruption capture, and more reliable crash-handler stack guarantee.
- `sentry_app_hang_pause` for backgrounding; Android NDK bindings for app-hang options and scope environment; feedback carries full scope/trace data.
- Crash replay breadcrumbs embedded in session replay; cache overflow discards reported; copy-on-write scope merge fixes data loss and speeds merges.
- Reliability: Crashpad upload waits, Android outbox created before NDK writes, macOS thread names without `task_for_pid`, Linux `CHAIN_AT_START` handler strategy, symbol resolution improvements.
