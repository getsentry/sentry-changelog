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

Releases covered: **2.61.1 · 2.62.0 · 2.63.0 · 2.64.0**

| Version | Date | Link |
|---------|------|------|
| 2.64.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.64.0) |
| 2.63.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.63.0) |
| 2.62.0 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.62.0) |
| 2.61.1 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-python/releases/tag/2.61.1) |

## What changed

- **gen_ai span streaming on by default (2.64.0):** `gen_ai` spans now stream as v2 envelope items, preventing drops on large transactions and removing size-based AI message truncation. Self-hosted users can opt out with `stream_gen_ai_spans=False`.
- **New integrations (2.62.0):** Added an `aiomysql` integration for async MySQL tracing and out-of-the-box support for HTTPX2.
- **MCP SDK v2 support (2.64.0):** The MCP integration now handles MCP SDK v2 handler signatures and the removed `request_ctx`.
- **PII gating hardened (2.64.0 · 2.63.0):** `url.full`, `url.query`, and `url.path` are now consistently gated behind `send_default_pii` across aiohttp, asyncpg, boto3, httpx, sanic, tornado, wsgi, stdlib, and ASGI integrations.
- **FastAPI fixes (2.63.0):** Fixed double-wrapping of sync handlers on FastAPI ≥ 0.137 and incorrect route paths for prefixed routers.
