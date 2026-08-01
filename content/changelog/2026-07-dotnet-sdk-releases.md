---
title: .NET SDK Releases — July 2026
slug: 2026-07-dotnet-sdk-releases
summary: log4net and NLog structured logs, IgnoreTransactions and BeforeSendFeedback, RecordTransaction API, and rate-limit / span-leak fixes.
categories:
  - SDK
platform:
  - dotnet
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

- [`6.8.0`](https://github.com/getsentry/sentry-dotnet/releases/tag/6.8.0) (2026-07-27)
- [`6.7.0`](https://github.com/getsentry/sentry-dotnet/releases/tag/6.7.0) (2026-07-15)

## TL;DR

- Structured logs integrations for `log4net` and `NLog`; Serilog `restrictedToMinimumLevel` supported when configuring in code.
- New `IgnoreTransactions` option filters transactions by name (substring/regex); `BeforeSendFeedback` inspects/modifies/drops user feedback.
- `SentrySdk.RecordTransaction` records already-completed transactions/spans (e.g. proxy replay); attachments can opt into transactions via `AddToTransactions`.
- Public helpers `IsFromUnhandledException` / `IsFromTerminalException`; Android tombstone options via `SentryOptions.Native`; `PreferTransactionNameProvider` option.
- Fixes: honor server rate limits for errors/check-ins/logs, stop leaking spans for Activities that never end, OTel failed-request route names preserved, scope defaults on structured logs.
