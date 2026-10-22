---
title: "Go SDK 1.0.0-alpha.1: Context-bound scopes"
slug: go-sdk-v1-alpha
summary: The first alpha of Go SDK v1 replaces hubs with context-bound scopes. Try it and share your feedback before the stable release.
categories:
  - SDK
platform:
  - go
  - go-http
  - go-echo
  - go-fasthttp
  - go-fiber
  - go-gin
  - go-iris
  - go-negroni
broadcastCategory: sdk_update
published: true
date: 2026-10-22
author: giannis.gkiortzis@sentry.io
---

The first alpha of the Sentry Go SDK v1, [`v1.0.0-alpha.1`](https://github.com/getsentry/sentry-go/releases/tag/v1.0.0-alpha.1), is ready for testing. Version 1 replaces the Hubs with a new ergonomic API around Go's `context.Context`. This alpha contains breaking changes, and the API may still change before v1.0.0.

- **Context-bound scopes:** `Hub` is removed. Pass `ctx` to `CaptureException`, `CaptureMessage`, and other APIs, and use `sentry.WithScope(ctx)` to isolate a request, job, or goroutine.
- **Integrations:** Framework integrations expose the request's context through `GetContext`. The Logrus and Zerolog integrations take a context instead of a hub or client options.
- **Envelope-based transports:** Custom transports now send envelopes instead of events.

```go
ctx, scope := sentry.WithScope(ctx)
scope.SetTag("route", "checkout")
sentry.CaptureException(ctx, err)
```

Upgrade the SDK and your integration modules.

```sh
go get github.com/getsentry/sentry-go@v1.0.0-alpha.1
go get github.com/getsentry/sentry-go/gin@v1.0.0-alpha.1
```

Follow the [migration guide](https://github.com/getsentry/sentry-go/blob/v1.0.0-alpha.1/MIGRATION.md#upgrading-to-v1) to update your code. We'd love to hear what was hard to migrate, what's missing, and what broke. Share your feedback in the [v1 alpha tracking issue](https://github.com/getsentry/sentry-go/issues/1463) before the stable release.
