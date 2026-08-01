---
title: Elixir SDK Releases — July 2026
slug: 2026-07-elixir-sdk-releases
summary: Logs capture_* config, client-report spans, no SDK-side truncation, and stronger Plug/Oban scrubbing.
categories:
  - SDK
platform:
  - elixir
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`13.3.0`](https://github.com/getsentry/sentry-elixir/releases/tag/13.3.0) (2026-07-07)

## TL;DR

- Logs support `capture_*` config for finer control over what gets captured as logs.
- Client reports now include span discard counts for better visibility into dropped trace data.
- SDK-side data truncation removed — oversized payloads are deferred to Relay.
- Plug scrubs query strings by default; Oban errors scrub sensitive fields; LiveView trace context trimmed to essentials.
- Stricter trace/span format handling; Ranch errors in `Sentry.LoggerHandler` improved.
