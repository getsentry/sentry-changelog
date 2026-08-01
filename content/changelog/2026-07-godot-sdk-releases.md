---
title: Godot SDK Releases — July 2026
slug: 2026-07-godot-sdk-releases
summary: Richer SentryEvent APIs and hardened shutdown so callbacks and .NET do not touch a tearing-down engine.
categories:
  - SDK
platform:
  - godot
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`2.1.0`](https://github.com/getsentry/sentry-godot/releases/tag/2.1.0) (2026-07-16)

## TL;DR

- `SentryEvent` gains `set_context()`, `set_user()`, and `set_fingerprint()` for richer event mutation.
- Shutdown closes earlier — before Godot tears down dependent systems — avoiding exit crashes with GDScript lambda `before_send` callbacks.
- .NET layer flushes pending events before the .NET scripting runtime shuts down.
- `init()` / `close()` error when called off the main thread, matching lifecycle requirements.
- Native/Cocoa/Android/JS/.NET dependency bumps for platform crash and telemetry fixes.
