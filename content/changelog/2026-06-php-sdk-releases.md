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

Releases covered: **4.28.0 · 4.29.0**

| Version | Date | Link |
|---------|------|------|
| 4.29.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-php/releases/tag/4.29.0) |
| 4.28.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-php/releases/tag/4.28.0) |

## What changed

- **SentryPropagator for OpenTelemetry (4.28.0):** New `SentryPropagator` class to inject and extract `sentry-trace` headers in OpenTelemetry propagation contexts.
- **gen_ai span v2 protocol (4.29.0):** `gen_ai` spans are now sent using the span v2 protocol, aligning with other SDKs.
- **Proxy-Authorization scrubbed by default (4.29.0):** `Proxy-Authorization` request headers are now scrubbed in addition to `Authorization`.
- **Bug fixes (4.28.0 · 4.29.0):** Feature flag values now correctly serialize as a JSON list when a flag is updated multiple times; fatal error handler state is reset when starting a new runtime context.
