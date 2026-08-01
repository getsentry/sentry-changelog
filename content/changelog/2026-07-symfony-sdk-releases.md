---
title: Symfony SDK Releases — July 2026
slug: 2026-07-symfony-sdk-releases
summary: Twig trace meta escaping, request cleanup on kernel terminate, and LoginListener token storage fix.
categories:
  - SDK
platform:
  - php-symfony
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`5.11.0`](https://github.com/getsentry/sentry-symfony/releases/tag/5.11.0) (2026-07-13)

## TL;DR

- Twig `sentry_trace_meta()` and `sentry_baggage_meta()` helpers now escape rendered values.
- `RequestFetcher` clears the active request on kernel termination even when no hub transaction is set.
- `LoginListener` uses Symfony's `security.untracked_token_storage` service.
