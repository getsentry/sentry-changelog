---
title: Ruby SDK Releases — September 2026
slug: 2026-09-ruby-sdk-releases
summary: Ruby 7.0.0 enables logs and metrics by default, defaults OTLP setup off, and replaces send_default_pii with granular data_collection.
categories:
  - SDK
platform:
  - ruby
  - ruby-rails
  - ruby-rack
broadcastCategory: sdk_update
published: false
date: 2026-09-01
author: neel.shah@sentry.io
---

Releases covered:

- [`7.0.0`](https://github.com/getsentry/sentry-ruby/releases/tag/7.0.0) (2026-09-01)

## TL;DR

- Logs are enabled by default and `enable_logs` is removed. With `sentry-rails`, automatic structured logging is on; disable it with `config.rails.structured_logging.enabled = false`.
- Metrics are enabled by default and `enable_metrics` is removed.
- `config.otlp.setup_otlp_traces_exporter` and `config.otlp.setup_propagator` now default to `false`.
- New granular [`data_collection`](https://docs.sentry.io/platforms/ruby/configuration/options/#data_collection) config replaces broad `send_default_pii` (deprecated; still defaults to `false` and backfills conservative collection settings).
- Rails breadcrumbs and related integrations now respect data collection controls.
