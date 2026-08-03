---
title: Electron SDK Releases — July 2026
slug: 2026-07-electron-sdk-releases
summary: JS stack frames from renderer OOM minidumps, macOS keychain prompt fix, and JavaScript SDK bumps through 10.67.0.
categories:
  - SDK
platform:
  - electron
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`7.16.0`](https://github.com/getsentry/sentry-electron/releases/tag/7.16.0) (2026-07-24)
- [`7.15.0`](https://github.com/getsentry/sentry-electron/releases/tag/7.15.0) (2026-07-01)

## TL;DR

- Renderer OOM minidumps now parse JavaScript stack frames for more actionable crash context.
- macOS keychain prompt fixed on latest Electron versions.
- IPC breadcrumb pop is correctly scoped; Electron `net` request arguments preserved.
- Bundled JavaScript SDKs updated through v10.67.0.
