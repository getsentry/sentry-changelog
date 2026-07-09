---
title: Elixir SDK Releases — June 2026
slug: 2026-06-elixir-sdk-releases
summary: PII scrubbing for stacktrace arguments, broader Plug scrubbing, and Oban non-list stacktrace handling.
categories:
  - SDK
platform:
  - elixir
broadcastCategory: sdk_update
published: false
date: 2026-06-30
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 13.2.0 | 2026-06-11 | [Release notes](https://github.com/getsentry/sentry-elixir/releases/tag/13.2.0) |

## TL;DR

- PII scrubbing now applies to stacktrace arguments — function args captured in stack traces are run through the configured scrubber before sending.
- Broader PII scrubbing coverage in the Plug integration.
- Oban error reporter now handles non-list stacktraces without crashing.

## Release notes

### New Features

13.2.0 extends PII scrubbing to stacktrace arguments. Previously, function arguments captured as part of an exception's stack trace were included verbatim; they are now passed through the configured scrubber so values matching patterns such as passwords, tokens, and other sensitive keys are redacted before the event is sent. The Plug integration also receives broader scrubbing coverage in this release — more request fields are now run through PII scrubbing rather than being included as-is.

### Bug Fixes

The Oban error reporter was crashing when a job produced a stacktrace in non-list form, which can happen with certain error types. It now handles that case gracefully. The release also excludes the `:bandit` domain from error capturing by default, reducing noise from expected Bandit HTTP server events.
