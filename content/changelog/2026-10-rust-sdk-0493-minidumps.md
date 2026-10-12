---
title: "Rust SDK 0.49.3: Native crash reporting with minidumps"
slug: rust-sdk-0493-native-crash-reporting-minidumps
summary: The Rust SDK can now capture native crashes as minidumps and send them to Sentry.
categories:
  - SDK
platform:
  - rust
broadcastCategory: sdk_update
published: true
date: 2026-10-12
author: daniel.szoke@sentry.io
---

Version 0.49.3 of the Sentry Rust SDK adds the [`sentry-minidump`](https://docs.rs/sentry-minidump/0.49.3/sentry_minidump/) integration. It captures native crashes, such as segfaults, as minidumps and sends them to Sentry.

- **Out-of-process capture:** A separate crash reporter process writes the minidump and sends it to Sentry, so crashes are reported even when your app can't recover.
- **Scope sync:** Send the user, tags, extra data and breadcrumbs to the crash reporter through the integration, so crash events include the same context as your other events.
- **Supported platforms:** Linux, macOS and Windows.

Enable the `minidump` feature on the `sentry` crate and add the integration to your client options:

```rust
let _guard = sentry::init(
    sentry::ClientOptions::new()
        .dsn("https://your-dsn@sentry.io/0")
        .add_integration(sentry::integrations::minidump::MinidumpIntegration::new()),
);
```

See the [release notes](https://github.com/getsentry/sentry-rust/releases/tag/0.49.3) for all changes.
