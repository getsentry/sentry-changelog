---
title: Unreal SDK Releases — July 2026
slug: 2026-07-unreal-sdk-releases
summary: Experimental Session Replay linked to crashes, Android NDK app-hang tracking, and crash/replay reliability fixes.
categories:
  - SDK
platform:
  - unreal
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`1.18.0`](https://github.com/getsentry/sentry-unreal/releases/tag/1.18.0) (2026-07-28)
- [`1.17.0`](https://github.com/getsentry/sentry-unreal/releases/tag/1.17.0) (2026-07-22)
- [`1.16.1`](https://github.com/getsentry/sentry-unreal/releases/tag/1.16.1) (2026-07-14)
- [`1.16.0`](https://github.com/getsentry/sentry-unreal/releases/tag/1.16.0) (2026-07-09)

## TL;DR

- Experimental Session Replay integrates gameplay clips with the Session Replay product and links them to crash events (opt-in via plugin settings); iOS support on UE 5.8+.
- Android app-hang tracking via NDK game-thread heartbeat (1.18.0).
- Crash-event breadcrumbs included in Apple crash session replays; structured logs linked with replays and with Android native crashes.
- Max session replay clip duration lowered to 20s to avoid 10 MiB server rejects at high resolution; legacy replay file attachment removed for envelope-based replay.
- Windows crash handler stack guarantee raised to 128 KiB for more reliable stack-overflow capture; execute bits fixed on bundled Linux/Mac crash handlers.
