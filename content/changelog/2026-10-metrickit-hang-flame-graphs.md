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
published: true
---

Starting with Sentry Apple SDK **9.31.0**, MetricKit hang flame graph attachments are available for public testing on iOS 15 and later and macOS 12 and later. Inspect the call paths sampled by Apple's operating system to investigate work that leaves your app unresponsive. The opt-in configuration is experimental and may change in a future release.

The SDK sends the sampled call tree as a `flamegraph.json` attachment instead of flattening it into event stack frames. This keeps the graph out of ordinary event stack trace trimming. Sentry symbolicates the attachment using your app's debug symbols and displays it in the event's **Flamegraph** section.

Sentry selects a representative stack trace from the sampled call trees for issue grouping, considering sample counts, stack depth, and in-app frames. Treat this stack as a starting point for investigation, not proof of the hang's cause. Grouping is best-effort, so hangs with the same cause can appear in separate issues. The flame graph includes branches outside the representative stack trace.

Add these options to your existing SDK initialization:

```swift
import Sentry

SentrySDK.start { options in
    options.dsn = "___PUBLIC_DSN___"
    options.enableMetricKit = true
    options.experimental.metrickit.hangReportingMode = .flamegraphAttachment
}
```

To capture only hang diagnostics with MetricKit in Swift, replace `options.enableMetricKit = true` with `options.experimental.metrickit.enabledDiagnosticReports = [.hang]`. This requires SDK **9.32.0** or later.

Upload matching [debug symbols](https://docs.sentry.io/platforms/apple/dsym/), then find hang reports in Issues with `error.mechanism:mx_hang_diagnostic`. Open a report and inspect its representative stack trace and **Flamegraph** section. If the diagnostic contains multiple call trees, use the tree selector to inspect them individually.

Frame width represents sample count, including samples in descendants, not exact duration. The graph shows aggregate observations, not execution order. Some trees aggregate samples across threads, so do not assume every tree represents the main thread. Apple controls which hangs are reported, so a missing report does not mean the app had no hangs. MetricKit is separate from App Hang tracking and is not affected by its timeout or pause controls.

Flame graph attachments count toward your attachment quota, and the associated hang events count toward your error-event quota. Profiling does not need to be enabled, and no profiling quota is consumed. Attachment retention and access permissions apply.

Each attachment is limited to **10 MiB**. If the SDK cannot create it, it falls back to legacy stack trace reporting. Sentry symbolicates at most the first **2,500 frame entries** in an attachment. Additional frames remain in the graph but may be unresolved. Without the opt-in setting, the SDK continues to use legacy reporting.

Read the [MetricKit documentation](https://docs.sentry.io/platforms/apple/configuration/metric-kit/) for configuration and limits, or follow the [cookbook recipe](https://sentry.io/cookbook/debug-ios-hangs-with-metrickit/) for the investigation workflow.
