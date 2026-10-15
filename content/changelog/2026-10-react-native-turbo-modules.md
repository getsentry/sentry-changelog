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
date: 2026-10-15
author: aleksandr.pantiukhov@sentry.io
---

Turbo Modules are the native modules of the React Native New Architecture. Your JavaScript code calls them to use the camera, storage, sensors, and other native features. The [TurboModule Context](https://docs.sentry.io/platforms/react-native/integrations/turbo-module-context/) integration of the Sentry React Native SDK records these calls and gives you this data:

- For native crashes, the module and method that were active at the time of the crash
- Call counts, error counts, and durations for each module and method, on transactions and root spans
- Breadcrumbs for slow asynchronous calls

The integration is enabled by default, but it wraps only the Sentry module. To get data about your own Turbo Modules, give them to the integration in the `modules` option:

```js
import NativeCameraModule from "./specs/NativeCameraModule";

Sentry.init({
  dsn: "___PUBLIC_DSN___",
  integrations: [
    Sentry.turboModuleContextIntegration({
      modules: [{ name: "NativeCameraModule", module: NativeCameraModule }],
    }),
  ],
});
```

If your app uses the Old Architecture, set `enableLegacyNativeModules: true` to record all registered `NativeModules` automatically.

To get all the improvements, upgrade to version [8.30.0](https://github.com/getsentry/sentry-react-native/releases/tag/8.30.0) or later. For all options and the data that the integration sends, read the [TurboModule Context](https://docs.sentry.io/platforms/react-native/integrations/turbo-module-context/) documentation.
