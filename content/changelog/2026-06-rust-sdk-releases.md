---
title: Rust SDK Releases — June 2026
slug: 2026-06-rust-sdk-releases
summary: Client report support for SDK-side data discards, new TransportFactory APIs, EnvelopeFilter types, and Hub::with deprecation.
categories:
  - SDK
platform:
  - rust
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered: **0.48.3**

| Version | Date | Link |
|---------|------|------|
| 0.48.3 | Jun 2026 | [Release notes](https://github.com/getsentry/sentry-rust/releases/tag/0.48.3) |

## What changed

- **Client report support (0.48.3):** The SDK now reports data it discards to Sentry's Stats page — covering transport drops, queue drops, rate-limit backoff, sampling, event processors, and `before_send*` callbacks, with span counts for dropped transactions.
- **New `TransportFactory` APIs (0.48.3):** Added `create_transport_with_options` and transport-specific options types (`ReqwestHttpTransportOptions`, `CurlHttpTransportOptions`, `UreqHttpTransportOptions`, `EmbeddedSVCHttpTransportOptions`) for cleaner custom transport construction.
- **`EnvelopeFilter` / `EnvelopeFilterCallbacks` (0.48.3):** New types to observe envelope items removed by `Envelope::filter`, including attachments dropped alongside their filtered event or transaction.
- **Deprecation (0.48.3):** `Hub::with` is deprecated — use `Hub::current` instead.
- **Bug fix (0.48.3):** Fixed `ureq` transport handling for 429 rate-limit and 413 payload-too-large HTTP responses.

_Tagged by @rahulchhabria_
