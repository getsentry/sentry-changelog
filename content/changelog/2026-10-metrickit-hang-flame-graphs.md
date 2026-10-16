---
title: "Apple SDK: MetricKit hang flame graph attachments"
slug: apple-sdk-metrickit-hang-flame-graphs
summary: Investigate unresponsive iOS and macOS apps with symbolicated MetricKit hang flame graphs, sent separately from event stack traces.
categories:
  - SDK
  - Performance
platform:
  - apple-ios
  - apple-macos
broadcastCategory: sdk_update
published: false
---

The Sentry Apple SDK **9.X.Y** adds flame graph attachments for MetricKit hang diagnostics. Inspect the call paths sampled by Apple's operating system to investigate work that leaves your app unresponsive.

The SDK sends the sampled call tree as a `flamegraph.json` attachment instead of flattening it into event stack frames. This keeps the graph out of ordinary event stack trace trimming. Sentry symbolicates the attachment using your app's debug symbols and displays it in the event's **Flamegraph** section.

Add these options to your existing SDK initialization:

```swift
import Sentry

SentrySDK.start { options in
    options.dsn = "___PUBLIC_DSN___"
    options.enableMetricKit = true
    options.experimental.metrickit.hangReportingMode = .flamegraphAttachment
}
```

Upload matching [debug symbols](https://docs.sentry.io/platforms/apple/dsym/), then find hang reports in Issues with `error.mechanism:mx_hang_diagnostic`. Open a report and inspect the flame graph for frequently sampled application paths and the calls beneath them.

Frame width represents sample count, not exact duration. The graph shows aggregate observations, not execution order, and does not require enabling SDK profiling. Apple controls which hangs are reported, so a missing report does not mean the app had no hangs.

Flame graph attachments count toward your attachment quota. The reporting mode is opt-in, and the SDK continues to use legacy reporting without it.

Read the [MetricKit documentation](https://docs.sentry.io/platforms/apple/configuration/metric-kit/) for configuration and limits, or follow the [cookbook recipe](https://sentry.io/cookbook/debug-ios-hangs-with-metrickit/) for the investigation workflow.
