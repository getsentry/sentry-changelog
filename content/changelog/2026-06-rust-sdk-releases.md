---
title: Rust SDK Releases — June 2026
slug: 2026-06-rust-sdk-releases
summary: Client report support for SDK-side data discards, transport API modernisation for custom transports, and Hub::with deprecation.
categories:
  - SDK
platform:
  - rust
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 0.48.3 | 2026-06-25 | [Release notes](https://github.com/getsentry/sentry-rust/releases/tag/0.48.3) |

## TL;DR

- SDK now reports discarded data to Sentry's Stats page — transport drops, sampling, event processors, and `before_send*` callbacks are all tracked automatically.
- New [`TransportFactory::create_transport_with_options`](https://docs.rs/sentry-core/0.48.3/sentry_core/trait.TransportFactory.html#method.create_transport_with_options) and transport-specific options types for cleaner custom transport construction.
- [`Hub::with`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.Hub.html#method.with) deprecated — use [`Hub::current()`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.Hub.html#method.current) instead.
- Fixed `ureq` transport handling of 429 and 413 HTTP responses.

## Release notes

### New Features

0.48.3 makes the SDK automatically track data it discards and report aggregate counts to Sentry's Stats page. Drops from transport layers, background queues, rate-limit backoff, sampling decisions, event processors, and `before_send`/`before_send_transaction` callbacks are all covered. For dropped transactions, span counts are included; for dropped logs and metrics, byte counts are included. No configuration is required — the SDK batches these reports and sends them in future envelopes automatically.

For users who configure built-in transports or who use custom transports, the transport API has been modernised in 0.48.3. [`TransportFactory::create_transport_with_options`](https://docs.rs/sentry-core/0.48.3/sentry_core/trait.TransportFactory.html#method.create_transport_with_options) is added as the preferred way to construct transports. It receives a [`TransportOptions`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.TransportOptions.html) struct containing only transport-relevant fields (DSN, user agent, proxy settings, TLS configuration) rather than full [`ClientOptions`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.ClientOptions.html), making custom transports simpler to write. Transport-specific options types are also introduced — [`ReqwestHttpTransportOptions`](https://docs.rs/sentry/0.48.3/sentry/transports/struct.ReqwestHttpTransportOptions.html), [`CurlHttpTransportOptions`](https://docs.rs/sentry/0.48.3/sentry/transports/struct.CurlHttpTransportOptions.html), [`UreqHttpTransportOptions`](https://docs.rs/sentry/0.48.3/sentry/transports/struct.UreqHttpTransportOptions.html), and [`EmbeddedSVCHttpTransportOptions`](https://docs.rs/crate/sentry/0.48.3/source/src/transports/embedded_svc_http.rs) — each with `with_options` constructors. The existing [`TransportFactory::create_transport`](https://docs.rs/sentry-core/0.48.3/sentry_core/trait.TransportFactory.html#method.create_transport) continues to work but now receives [`ClientOptions`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.ClientOptions.html) reconstructed from [`TransportOptions`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.TransportOptions.html), which only includes transport-relevant fields. Nothing changes for users who use the built-in transports without customizations.

### Deprecations

0.48.3 deprecates [`Hub::with`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.Hub.html#method.with). Use [`Hub::current()`](https://docs.rs/sentry-core/0.48.3/sentry_core/struct.Hub.html#method.current) to access the current hub.

### Bug Fixes

The `ureq` HTTP transport was not correctly handling 429 (Too Many Requests) and 413 (Payload Too Large) response codes. Both are now processed as the appropriate transport-level errors.
