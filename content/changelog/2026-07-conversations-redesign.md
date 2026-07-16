---
title: Conversations, Redesigned
slug: conversations-redesign
summary: A rebuilt Conversations view makes AI agent sessions easier to read — a cleaner chat-style timeline, message parts you can expand inline, and one-click access to the underlying spans.
categories:
  - AI
  - Product
broadcastCategory: feature
published: false
date: 2026-07-16
author: sasha.blumenfeld@sentry.io
---

We've rebuilt [Conversations](https://docs.sentry.io/ai/monitoring/conversations/) from the ground up. Since launching in open beta, it has become the fastest way to see what actually happened during a session with your AI agent — but reading through a long exchange of messages, tool calls, and responses could still be a lot to take in. The redesign focuses on making those sessions easy to read at a glance, then easy to drill into when something goes wrong.

## What changed

- **A cleaner chat-style timeline.** Conversations groups spans by `gen_ai.conversation.id`, so a single session shows up as one continuous exchange — even when it spans multiple traces, or when several conversations happen inside one trace. The redesigned detail view lays that out as a familiar chat transcript of user inputs, assistant responses, and tool calls.
- **Message parts you can expand inline.** Each message is broken out by part type — `text`, `reasoning`, `tool_call`, and `tool_call_response` — so you can skim the user-visible content and expand internal reasoning or tool payloads only when you need them.
- **One click from a message to its spans.** Click any message to open the underlying spans behind it, including individual LLM generations and tool executions, with timing and error information attached. Tracing a conversation from start to finish and pinpointing where it broke no longer means hand-reading a raw trace.

## Getting started

Find it under **Explore → Conversations** in the sidebar. Conversations shows up automatically once your agent's spans carry a `gen_ai.conversation.id` — many SDK integrations infer it for you, and you can also set it explicitly. See the [Conversations docs](https://docs.sentry.io/ai/monitoring/conversations/) for setup details and the full list of supported message and part types.
