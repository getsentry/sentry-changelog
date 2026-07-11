---
title: Python SDK Releases — June 2026
slug: 2026-06-python-sdk-releases
summary: gen_ai span streaming on by default, new aiomysql and HTTPX2 integrations, MCP SDK v2 support, and broad PII-gating improvements.
categories:
  - SDK
platform:
  - python
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 2.64.0 | 2026-06-30 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.64.0) |
| 2.63.0 | 2026-06-16 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.63.0) |
| 2.62.0 | 2026-06-08 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.62.0) |
| 2.61.1 | 2026-06-01 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.61.1) |

## TL;DR

- `gen_ai` spans now stream as v2 envelope items by default — prevents drops on large transactions and removes size-based AI message truncation; self-hosted users can opt out with `stream_gen_ai_spans=False`.
- New `aiomysql` integration for async MySQL tracing; added automatic HTTPX2 instrumentation.
- MCP SDK v2 handler signature is now supported in the MCP integration.
- `url.full`, `url.query`, `url.path`, and `url.fragment` are now consistently gated behind `send_default_pii` across aiohttp, asyncpg, boto3, httpx, sanic, tornado, wsgi, stdlib, and ASGI integrations.
- FastAPI: fixed double-wrapping of sync handlers on FastAPI ≥ 0.137 and incorrect route paths for prefixed routers.

## Release notes

### New Features

In 2.62.0 a new `aiomysql` integration lands for async MySQL query tracing — add `AioMySQLIntegration()` to your `integrations` list to enable it. The same release adds automatic HTTPX2 support: requests made through the `httpx2` package are instrumented with no extra setup required.

2.64.0 makes `gen_ai` span streaming the default. Previously AI spans were embedded inside their parent transaction and subject to the same payload size limits; with streaming they travel as independent v2 envelope items. This means they can no longer be dropped when a transaction payload grows too large, and AI message data is no longer truncated by the SDK. Self-hosted Sentry users whose instance does not yet support streamed spans should opt out via `stream_gen_ai_spans=False`.

Also in 2.64.0, the MCP integration now handles the handler signature introduced in MCP SDK v2, where the `request_ctx` parameter was removed.

### Bug Fixes

In 2.63.0, FastAPI ≥ 0.137 sync route handlers were being wrapped twice, interfering with some middleware patterns. The SDK now checks for an existing wrapper before applying its own. Additionally, transaction names for routes nested inside prefixed routers now use the effective routed path rather than the raw route string.

2.64.0 tightens PII gating across a broad set of integrations. Multiple integrations — aiohttp, asyncpg, boto3, httpx, httpx2, pyreqwest, sanic, stdlib, starlette, tornado, wsgi, and ASGI — were including full URLs including query strings in span attributes unconditionally. `url.full`, `url.path`, `url.query`, and `url.fragment` are now only included when `send_default_pii=True`.

In 2.62.0, the RQ integration was missing `functools.wraps()` on patched job functions, causing the wrapped function's `__name__` and other metadata to be lost. This is now preserved.
