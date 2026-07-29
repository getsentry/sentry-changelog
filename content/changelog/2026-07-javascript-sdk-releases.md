---
title: JavaScript SDK Releases — July 2026
slug: 2026-07-javascript-sdk-releases
summary: SvelteKit 3 support, Cloudflare nodejs_compat entrypoint, minimal OTel tracer by default, and richer URL attributes on routing spans.
categories:
  - SDK
platform:
  - javascript
  - node
  - react-native
broadcastCategory: sdk_update
published: false
date: 2026-07-31
author: rahulchhabria@sentry.io
---

Releases covered:

| Version | Date | Link |
|---------|------|------|
| 10.68.0 | 2026-07-24 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.68.0) |
| 10.67.0 | 2026-07-20 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.67.0) |
| 10.66.0 | 2026-07-16 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.66.0) |
| 10.65.0 | 2026-07-10 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.65.0) |
| 10.64.0 | 2026-07-07 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.64.0) |
| 10.63.0 | 2026-07-01 | [Release notes](https://github.com/getsentry/sentry-javascript/releases/tag/10.63.0) |

## TL;DR

- SvelteKit 3 is supported with automatic version detection — client pageload/navigation tracing and server-side native tracing work alongside SvelteKit 2 with no Sentry setup changes.
- New `@sentry/cloudflare/nodejs_compat` entrypoint unlocks Node SDK features on Workers with the `nodejs_compat` flag, including `prismaIntegration` and Vercel AI v7.
- Node now uses Sentry's minimal OpenTelemetry tracer provider by default for lower overhead; opt back into the full provider with `openTelemetryBasicTracerProvider: true`.
- Routing spans across browser and framework SDKs now include `url.template`, `url.path`, and `url.full` attributes.

## Release notes

### New Features

10.67.0 adds support for the SvelteKit 3 pre-release. Client-side pageload and navigation tracing and server-side native tracing work for both SvelteKit 2 and 3; the SDK detects your kit version and picks the right implementation automatically, so no Sentry-specific setup changes are required.

10.64.0 ships a dedicated `@sentry/cloudflare/nodejs_compat` entrypoint for Workers that enable the `nodejs_compat` compatibility flag. It is a drop-in import swap from `@sentry/cloudflare` and unlocks Node SDK features on Cloudflare, including `prismaIntegration` and AI v7 support in `vercelAiIntegration`. This entrypoint is planned to become the default in v11.

Also in 10.64.0, the Node SDK registers Sentry's minimal `SentryTracerProvider` by default. Native Sentry spans are created directly instead of routing through the full OpenTelemetry SDK span pipeline, which reduces overhead when you don't need the full OTel stack. Set `openTelemetryBasicTracerProvider: true` (or provide custom `openTelemetrySpanProcessors`) to fall back to the full `BasicTracerProvider`.

10.65.0 standardizes URL attributes on pageload and navigation spans across Angular, Astro, browser, Ember, Next.js, React, React Router, Remix, Solid, SvelteKit, Vue, and Nuxt. Spans now carry `url.template`, `url.path`, and/or `url.full` so route grouping and filtering stay consistent across frameworks.

Orchestrion and diagnostics-channel instrumentation rolled out broadly this month. 10.66.0 adds orchestrion bundler plugins, a Next.js opt-in, NestJS diagnostics-channel instrumentation, and knex/mysql2/kafkajs/dataloader/generic-pool rewrites. 10.67.0 extends that to MongoDB, Mongoose, Remix, Koa, AWS SDK extensions (S3, SQS, SNS, Lambda, Bedrock, and more), LangChain/LangGraph, and Cloudflare Workers AI and rate-limiter bindings. 10.68.0 continues with a Cloudflare Vite orchestrion plugin, Firebase migration, NestJS WebSocket error support in `SentryGlobalFilter`, and auto-instrumentation for Durable Object, WorkerEntrypoint, and Workflow classes on the v10 Cloudflare path.

10.66.0 also adds `dataCollection.databaseQueryData` (for example Supabase filter values and mutation bodies) and `dataCollection.graphQL` controls for opting into richer query payloads.

### Bug Fixes

10.64.0 improves browser telemetry flush-on-hide behavior, Next.js middleware root-span handling on the Node runtime, and Anthropic stream `stop_reason` capture from `message_delta` events.

10.65.0 hardens Session Replay so rrweb recording no longer dies when the emit callback throws, and skips client reports for replay failures after stop.

10.66.0 preserves trace propagation across ignored spans, fixes React Router history/relative navigation URL attributes, preserves parent path prefixes for descendant React Router route names, and removes a browser `readystatechange` listener leak.

10.67.0 and 10.68.0 tighten Cloudflare Durable Object lifecycle handling (built-in handlers, custom WorkerEntrypoint RPC, teardown via original `waitUntil`, skip internal DO SQL spans), fix SvelteKit 3 frame rewriting, prevent `functionToStringIntegration` infinite recursion, and stop propagating `baggage: "undefined"` when DSC is missing.

### Deprecations

10.66.0 deprecates the `@sentry/node-core` and `@sentry/tanstackstart` packages.
