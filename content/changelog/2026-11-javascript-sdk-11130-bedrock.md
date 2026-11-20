---
title: "JavaScript SDK 11.13.0: Bedrock prompts and responses"
slug: javascript-sdk-11130-bedrock-tracing
summary: The JavaScript SDK now records prompts and responses on Amazon Bedrock spans.
categories:
  - SDK
  - AI
platform:
  - node
  - node-awslambda
broadcastCategory: sdk_update
published: false
date: 2026-11-20
author: andrei.borza@sentry.io
---

Version 11.13.0 of the Sentry JavaScript SDK records prompts, system instructions, tool definitions and responses on Amazon Bedrock spans, as the other AI integrations do. This applies to the `Converse`, `ConverseStream`, `InvokeModel` and `InvokeModelWithResponseStream` commands. Since 11.12.0, Bedrock spans also report correct token usage, including prompt-cache tokens.

The `awsIntegration` is enabled automatically when `@aws-sdk/client-bedrock-runtime` is used. Tracing must be enabled to see Bedrock requests.

To stop recording prompts or responses only for Bedrock, set the `awsIntegration` options:

```js
Sentry.init({
  integrations: [Sentry.awsIntegration({ recordInputs: false, recordOutputs: false })],
});
```
