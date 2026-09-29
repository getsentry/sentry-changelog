---
title: "JavaScript SDK 11.1.0: TypeSafe Jev tracing"
slug: javascript-sdk-1110-typesafe-jev-tracing
summary: The JavaScript SDKs now trace TypeSafe Jev calls.
categories:
  - SDK
  - AI
platform:
  - javascript
  - node
broadcastCategory: sdk_update
published: false
date: 2026-09-29
author: andrei.borza@sentry.io
---

Version 11.1.0 of the Sentry JavaScript SDKs traces TypeSafe Jev. Each call generates a `gen_ai.evaluate` span with the model, token usage, questions and answers.

- **TypeSafe AI SDK:** The new `typesafeIntegration` instruments `@typesafe-ai/sdk` and is enabled by default. For runtimes without auto-instrumentation, use `instrumentTypeSafeClient()`.
- **Vercel AI SDK:** The [Vercel AI integration](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/vercelai/) now instruments `experimental_evaluate`, including Jev calls through the AI Gateway.

Questions and answers are recorded based on your [`dataCollection.genAI`](https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection) settings. See the [release notes](https://github.com/getsentry/sentry-javascript/releases/tag/11.1.0) for all changes.
