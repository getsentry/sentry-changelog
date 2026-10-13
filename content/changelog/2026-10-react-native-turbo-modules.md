---
title: "React Native SDK: Turbo Module insights"
slug: react-native-sdk-turbo-module-insights
summary: The React Native SDK now records the calls, duration, and errors of native modules, and adds the active call to crash reports.
categories:
  - SDK
  - Performance
platform:
  - react-native
broadcastCategory: sdk_update
published: true
date: 2026-10-13
author: aleksandr.pantiukhov@sentry.io
---

Turbo Modules are the native modules of the React Native New Architecture. Your JavaScript code calls them to use the camera, storage, sensors, and other native features. Starting with version [8.14.0](https://github.com/getsentry/sentry-react-native/releases/tag/8.14.0), the Sentry React Native SDK records these calls. If you initialize the SDK with `enableNative` (the default), the `turboModuleContextIntegration` is active and needs no setup.

## Crash context

When your app crashes in native code, the crash report shows the Turbo Module method that was active at that time. The SDK adds the `turbo_module` context and the `turbo_module.name` and `turbo_module.method` tags to the event. Version 8.30.0 fixes stale tags on Android native crashes.

## Aggregated statistics

The SDK counts the calls, the errors, and the total duration for each module and method. When a transaction finishes, the SDK adds a `turbo_modules.aggregate` child span with the full breakdown. The root span gets the `turbo_modules.call_count`, `turbo_modules.error_count`, `turbo_modules.total_ms`, and `turbo_modules.top_module_ms` measurements.

If your app runs for a long time without transactions, the SDK sends the statistics in an info-level event every 30 seconds. If there is no new data, the SDK does not send the event. Calls from the SDK itself (`RNSentry`) are not counted.

## Performance data on spans

When a transaction or a span ends, the SDK adds the call count, the duration, and the error count for each module and method. For example, a navigation span shows the native calls that occurred during the screen change. The summary attributes `turbo_module.total_call_count`, `turbo_module.total_duration_ms`, and `turbo_module.top_module` show the total cost.

Asynchronous calls that take more than 500 ms add a `native.turbo_module` breadcrumb. Methods that use success and failure callbacks instead of a Promise get correct durations too.

## Old Architecture support

If your app uses the Old Architecture, you can get the same data for `NativeModules`. Use the `arch` field to tell the two sources apart:

```js
Sentry.init({
  dsn: "___PUBLIC_DSN___",
  integrations: [
    Sentry.turboModuleContextIntegration({
      enableLegacyNativeModules: true,
      slowCallThresholdMs: 500,
    }),
  ],
});
```

For all options and changes, read the React Native SDK [changelog](https://github.com/getsentry/sentry-react-native/blob/main/CHANGELOG.md). To get all the improvements, upgrade to version [8.30.0](https://github.com/getsentry/sentry-react-native/releases/tag/8.30.0) or later.
