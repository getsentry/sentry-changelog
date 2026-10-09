---
title: Agent Tracing improvements for JavaScript SDKs
slug: javascript-agent-tracing-improvements
summary: The JavaScript SDKs now trace more AI frameworks, providers, and classifiers across Node.js, Bun, Cloudflare, and Deno, with more consistent data in traces.
image: /img/changelog/2026-10-agent-tracing-javascript.jpeg
categories:
  - AI
  - SDK
platform:
  - node
  - bun
  - deno
  - node-cloudflare-workers
  - node-cloudflare-pages
broadcastCategory: sdk_update
published: true
date: 2026-10-09
author: andrei.borza@sentry.io
---

The JavaScript SDKs now support more AI frameworks and providers, with automatic instrumentation across Node.js, Bun, Cloudflare and Deno out of the box since [11.0.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.0.0).

This includes Anthropic, OpenAI, Google GenAI, Vercel AI, LangChain, and LangGraph, alongside the new integrations below.

## New frameworks and providers support

- [**eve**](https://docs.sentry.io/platforms/javascript/guides/eve/): Dedicated instrumentation for eve apps, including `eveConversationHook()` to connect eve sessions to Sentry conversations (since [11.0.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.0.0)).

- [**Mastra**](https://docs.sentry.io/platforms/javascript/guides/mastra/): First-party instrumentation, including new classifier evaluations (since [11.6.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.6.0)).

- [**Flue**](https://docs.sentry.io/platforms/javascript/guides/node/agent-tracing/flue/): Instrumentation registers automatically in bundled Workers. Messages and token usage follow the `gen_ai` conventions (since [11.5.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.5.0)).

- [**Pi Durable**](https://docs.sentry.io/platforms/javascript/guides/pi-durable/): The new `piDurableIntegration` captures agent runs, model requests, and tool calls (since [11.6.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.6.0)).

- [**Groq**](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/groq/), [**Together AI**](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/together-ai/), and [**Mistral AI**](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/mistral/): New integrations expand provider coverage (since [11.0.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.0.0)).

- [**MCP servers**](https://docs.sentry.io/platforms/javascript/guides/node/mcp-monitoring/): The default `mcpServerIntegration` automatically instruments `McpServer` instances, replacing the need to call `wrapMcpServerWithSentry` (since [11.1.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.1.0)).

## Classifier tracing

Popular classifiers like [Jev](https://docs.typesafe.ai/introduction/coding-agents) are now instrumented and produce `gen_ai.evaluate` spans.

- The new [`typesafeIntegration`](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/typesafe/) instruments `@typesafe-ai/sdk` (since [11.1.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.1.0)).

- The [`vercelAIIntegration`](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/vercelai/#trace-jev-evaluations) traces `experimental_evaluate` Jev calls (since [11.1.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.1.0)).

- [Workers AI](https://docs.sentry.io/platforms/javascript/guides/cloudflare/agent-tracing/workers-ai/#trace-jev-evaluations) calls to [TypeSafe Jev](https://docs.typesafe.ai/introduction/coding-agents) and [Cloudflare Clef](https://developers.cloudflare.com/workers-ai/models/clef/) are traced (since [11.3.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.3.0)).

- [Mastra](https://docs.sentry.io/platforms/javascript/guides/mastra/) Classifier calls are traced (since [11.6.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.6.0)).

- [LangChain](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/langchain/) and [LangGraph](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/langgraph/) trace [`TypeSafeClassifier`](https://docs.langchain.com/oss/javascript/integrations/providers/typesafe) calls (since [11.6.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.6.0)).


## More context and consistent data in traces

- **Inputs and outputs are collected by default**, controlled through [`dataCollection.genAI`](<https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection>), so you can inspect what the model received and returned.

- **Token usage is normalized across providers**, while preserving cache token breakdowns (since [11.5.0](https://github.com/getsentry/sentry-javascript/releases/tag/11.5.0)).

- **Conversation IDs are captured from more sources**, including LangChain invoke configuration and the OpenAI conversation option in Vercel AI.

- **Handled errors no longer produce error reports** in the OpenAI, Anthropic, Google GenAI, LangChain, and LangGraph integrations, reducing noise from errors your application already handles.

Upgrade to the latest SDK release to get these improvements. If you’re upgrading from v10, follow the [v11 migration guide](https://docs.sentry.io/platforms/javascript/migration/v10-to-v11/). See the [Agent Tracing documentation](https://docs.sentry.io/ai/monitoring/agents) for supported frameworks and setup instructions.
