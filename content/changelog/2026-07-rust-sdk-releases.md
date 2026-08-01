---
title: Rust SDK Releases — July 2026
slug: 2026-07-rust-sdk-releases
summary: ClientOptions is non_exhaustive with builder setters, logs/metrics on by default, strict trace continuation, and a critical panic fix.
categories:
  - SDK
platform:
  - rust
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`0.49.0`](https://github.com/getsentry/sentry-rust/releases/tag/0.49.0) (2026-07-29)
- [`0.48.5`](https://github.com/getsentry/sentry-rust/releases/tag/0.48.5) (2026-07-14)
- [`0.48.4`](https://github.com/getsentry/sentry-rust/releases/tag/0.48.4) (2026-07-07)

## TL;DR

- `ClientOptions` is `#[non_exhaustive]` — construct with builder setters (`ClientOptions::new().dsn(...).debug(true)`); struct-literal syntax no longer compiles (0.49.0, setters landed in 0.48.4).
- `logs` and `metrics` features are enabled by default in the `sentry` crate — disable explicitly if you do not want structured logs/metrics telemetry.
- Strict trace continuation: `org_id` / `strict_trace_continuation` options and rejection of incompatible incoming `sentry-org_id` values; new preferred `TracePropagationContext` type.
- `sentry-opentelemetry` now targets OpenTelemetry 0.32; public sample-rate fields moved behind sampling strategy accessors.
- 0.48.5 fixes a panic (and potential double-panic abort) in the SDK — upgrade recommended even if you stay on the 0.48 line.
