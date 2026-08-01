---
title: Go SDK Releases — July 2026
slug: 2026-07-go-sdk-releases
summary: Granular DataCollection options replace broad SendDefaultPII, logging integrations stop creating issues, and Fiber route-name fixes.
categories:
  - SDK
platform:
  - go
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`v0.48.0`](https://github.com/getsentry/sentry-go/releases/tag/v0.48.0) (2026-07-14)

## TL;DR

- New `ClientOptions.DataCollection` independently controls automatic user info, cookies, headers, HTTP bodies, and query params — when set it overrides `SendDefaultPII`.
- Logging integrations no longer create issues from log lines (breaking change) — use logging as logs/telemetry rather than automatic issue creation.
- `PushScope` shorthand now returns the new scope reference for chaining.
- Fiber route names work correctly with middleware; empty event IDs omitted on standalone client reports; `%` literals preserved in log messages.
- Event processors are isolated across clones; 32-bit unaligned atomic panic in telemetry buffers fixed.
