---
title: "Rust SDK 0.49.3: Native crash reporting"
slug: rust-sdk-0493-native-crash-reporting-minidumps
summary: The Rust SDK can now report native crashes, such as segfaults in unsafe code, to Sentry.
categories:
  - SDK
platform:
  - rust
broadcastCategory: sdk_update
published: true
date: 2026-10-12
author: daniel.szoke@sentry.io
---

Version [0.49.3](https://github.com/getsentry/sentry-rust/releases/tag/0.49.3) of the Sentry Rust SDK adds native crash reporting on Linux, macOS, and Windows. The SDK captures native crashes, such as segmentation faults, as minidumps and sends them to Sentry.

Safe Rust shouldn't crash without panicking, and the SDK already reports panics. But `unsafe` code and calls into C libraries through FFI can crash your app without a panic. Native crash reporting captures these crashes.

To enable it, turn on the `minidump` feature of the `sentry` crate and add the integration when you initialize the SDK:

```rust
let _guard = sentry::init(
    sentry::ClientOptions::new()
        .dsn("https://your-dsn@sentry.io/0")
        .add_integration(sentry::integrations::minidump::MinidumpIntegration::new()),
);
```

See the [Native Crash Reporting docs](https://docs.sentry.io/platforms/rust/native-crash-reporting/) for setup details.
