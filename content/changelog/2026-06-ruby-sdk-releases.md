---
title: Ruby SDK Releases — June 2026
slug: 2026-06-ruby-sdk-releases
summary: New sentry-yabeda gem for Metrics, Kamal release detection, Sidekiq retry limit fix, and stacktrace payload leak fix.
categories:
  - SDK
platform:
  - ruby
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **6.6.0 · 6.6.1 · 6.6.2**

| Version | Date | Link |
|---------|------|------|
| 6.6.2 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-ruby/releases/tag/6.6.2) |
| 6.6.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-ruby/releases/tag/6.6.1) |
| 6.6.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-ruby/releases/tag/6.6.0) |

## What changed

- **New `sentry-yabeda` gem (6.6.0):** Integrates Sentry Metrics with [Yabeda](https://github.com/yabeda-rb/yabeda) — add `gem "sentry-yabeda"` to your Gemfile; it registers automatically on require, no extra setup needed.
- **Kamal release detection (6.6.0):** The SDK now auto-detects the release version from Kamal deployments.
- **Sidekiq fix (6.6.0):** Errors are now correctly reported when the Sidekiq retry limit is set below the attempt threshold.
- **Stacktrace fix (6.6.0):** Stopped leaking internal frame state into the event payload.
- **Concurrency fix (6.6.1):** `TelemetryEventBuffer` is now guarded against re-entrant mutex acquisition.

_Tagged by @rahulchhabria_
