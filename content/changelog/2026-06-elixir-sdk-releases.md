---
title: Elixir SDK Releases — June 2026
slug: 2026-06-elixir-sdk-releases
summary: PII scrubbing for stacktrace arguments, broader Plug scrubbing, and Oban non-list stacktrace handling.
categories:
  - SDK
platform:
  - elixir
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **13.2.0**

| Version | Date | Link |
|---------|------|------|
| 13.2.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-elixir/releases/tag/13.2.0) |

## What changed

- **PII scrubbing for stacktrace args (13.2.0):** Implemented PII scrubbing for stacktrace arguments to prevent accidental capture of sensitive data.
- **Broader Plug scrubbing (13.2.0):** Extended PII scrubbing coverage in the Plug integration for more request fields.
- **Oban fix (13.2.0):** The Oban error reporter now handles non-list stacktraces without crashing.

_Tagged by @rahulchhabria_
