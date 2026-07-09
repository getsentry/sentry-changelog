---
title: PHP SDK Releases — June 2026
slug: 2026-06-php-sdk-releases
summary: SentryPropagator for OpenTelemetry, gen_ai span v2 protocol, and Proxy-Authorization header scrubbing by default.
categories:
  - SDK
platform:
  - php
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 4.29.0 | 2026-06-29 | [Release notes](https://github.com/getsentry/sentry-php/releases/tag/4.29.0) |
| 4.28.0 | 2026-06-11 | [Release notes](https://github.com/getsentry/sentry-php/releases/tag/4.28.0) |

## TL;DR

- New `SentryPropagator` for OpenTelemetry header injection/extraction.
- `gen_ai` spans now use the span v2 protocol.
- `Proxy-Authorization` request headers scrubbed by default.
- Fixed feature flag JSON serialization on multiple updates; fatal error handler state reset on new runtime context.

## Release notes

### New Features

4.28.0 adds a `SentryPropagator` class implementing the OpenTelemetry `TextMapPropagatorInterface`. It injects and extracts the `sentry-trace` header in OTel propagation contexts, making it straightforward to use Sentry distributed tracing in OpenTelemetry-instrumented PHP applications.

4.29.0 sends `gen_ai` spans using the span v2 protocol, aligning PHP with the behaviour already shipping in Python and JavaScript. The same release scrubs `Proxy-Authorization` request headers by default, alongside the existing `Authorization` scrubbing.

### Bug Fixes

4.28.0 fixes a bug where updating a feature flag value more than once within a single request corrupted the serialised flag list. The SDK now correctly preserves the list as a JSON array across multiple updates.

4.29.0 fixes the fatal error handler's state not being reset when a new runtime context was started — for example in long-lived workers using Swoole or similar frameworks. This could cause the handler to behave incorrectly across request boundaries.
