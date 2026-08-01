---
title: Python SDK Releases — July 2026
slug: 2026-07-python-sdk-releases
summary: trace_lifecycle and ignore_spans promoted to top-level options, messaging.destination.name on queue consumers, and safer streaming-span child creation.
categories:
  - SDK
platform:
  - python
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`2.66.1`](https://github.com/getsentry/sentry-python/releases/tag/2.66.1) (2026-07-22)
- [`2.66.0`](https://github.com/getsentry/sentry-python/releases/tag/2.66.0) (2026-07-16)
- [`2.65.0`](https://github.com/getsentry/sentry-python/releases/tag/2.65.0) (2026-07-13)

## TL;DR

- `trace_lifecycle` and `ignore_spans` are now top-level SDK options (promoted from nested config) in 2.66.0.
- Queue integrations (Huey, ARQ, Dramatiq, RQ) set `messaging.destination.name` on producer/consumer spans for clearer destination attribution.
- Streaming-path child spans are skipped when there is no current span across HTTP clients, databases, web frameworks, Django, and task queues — avoiding orphaned children.
- Django async middleware `process_*` hooks no longer raise `ValueError`; Starlette no longer overwrites a user set during the request in `AuthenticationMiddleware`.
- Exceptions raised inside `traces_sampler` and related callbacks are handled safely (2.66.1); multiple `sentry-trace` headers now take the first value.
