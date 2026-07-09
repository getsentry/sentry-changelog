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

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 6.6.2 | 2026-06-09 | [Release notes](https://github.com/getsentry/sentry-ruby/releases/tag/6.6.2) |
| 6.6.1 | 2026-06-08 | [Release notes](https://github.com/getsentry/sentry-ruby/releases/tag/6.6.1) |
| 6.6.0 | 2026-06-01 | [Release notes](https://github.com/getsentry/sentry-ruby/releases/tag/6.6.0) |

## TL;DR

- New `sentry-yabeda` gem integrates Sentry Metrics with Yabeda — add to Gemfile, registers automatically.
- Kamal release version auto-detection.
- Sidekiq fix: errors now reported when retry limit is below the attempt threshold.
- Fixed internal frame state leaking into the event payload's stacktrace.
- `TelemetryEventBuffer` guarded against re-entrant mutex acquisition; metric attribute hash mutation fixed.

## Release notes

### New Features

6.6.0 ships a new `sentry-yabeda` gem integrating Sentry Metrics with [Yabeda](https://github.com/yabeda-rb/yabeda), a Ruby metrics instrumentation framework. Add `gem "sentry-yabeda"` to your `Gemfile` and initialise Sentry with `config.enable_metrics = true`. The adapter registers itself automatically when the gem is required — there is no extra setup. It also normalises Yabeda's plural unit names (e.g. `seconds`) to Sentry's singular form (`second`).

Also in 6.6.0, release version detection now works for applications deployed with [Kamal](https://kamal-deploy.org/). The SDK reads the Kamal deployment metadata automatically without any additional configuration.

### Bug Fixes

6.6.0 fixes the Sidekiq integration not reporting errors when the retry limit was configured to a value below the job's `attempt_threshold`. The threshold comparison is now correct.

6.6.0 also fixes internal frame metadata leaking into the event payload's stacktrace representation — this metadata is now stripped before the event is sent — and fixes an existing baggage header being overwritten when a `baggage` header was already present on an outgoing request. The SDK now leaves existing baggage intact.

6.6.1 guards `TelemetryEventBuffer` against re-entrant mutex acquisition. A telemetry flush could trigger another telemetry event, which would attempt to re-acquire the same mutex and deadlock.

6.6.2 fixes metric attribute hashes being mutated in place inside `capture_metric`. When the same attribute hash was reused by the caller for a subsequent metric, the mutation caused incorrect attributes on the later metric. Attributes are now duplicated before modification.
