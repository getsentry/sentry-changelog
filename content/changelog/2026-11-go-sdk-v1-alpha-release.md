---
title: "Go SDK 1.0.0-alpha.1: Redesigned API"
slug: go-sdk-v1-alpha
summary: Sentry Go SDK v1 redesigns the API around Go's context, removing hubs. Try the alpha and share feedback before the stable release.
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
date: 2026-11-05
author: giannis.gkiortzis@sentry.io
---

We redesigned the Sentry Go SDK's API for v1, and you can try the new API now in [v1.0.0-alpha.1](https://github.com/getsentry/sentry-go/releases/tag/v1.0.0-alpha.1).

The main simplification is that we removed hubs. The SDK now stores scopes in Go's `context.Context`, and many of the SDK's APIs, such as `CaptureException`, take or return a context.

To upgrade, follow the [migration guide](https://github.com/getsentry/sentry-go/blob/master/MIGRATION.md#upgrading-to-v1). Let us know how the migration goes in the [v1 alpha tracking issue](https://github.com/getsentry/sentry-go/issues/1463), so we can make the move to the stable v1 release as smooth as possible.
