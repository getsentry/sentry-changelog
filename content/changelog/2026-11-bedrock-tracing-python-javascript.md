---
title: "Bedrock tracing in the Python and JavaScript SDKs"
slug: bedrock-tracing-python-javascript
summary: The Python and JavaScript SDKs now trace Amazon Bedrock calls, with model, token usage, prompts and responses.
categories:
  - SDK
  - AI
platform:
  - python
  - node
  - node-awslambda
broadcastCategory: sdk_update
published: true
date: 2026-11-20
author: alexander.webb@sentry.io
---

The Sentry Python and JavaScript SDKs now trace Amazon Bedrock calls. Each call creates a `gen_ai` span with the model, token usage, inputs and outputs. Tracing must be enabled to see Bedrock requests.

## Python

Version 2.75.0 of the Sentry Python SDK traces Bedrock Converse and ConverseStream calls made with `boto3`. Each call generates a `gen_ai.chat` span.

The Boto3 integration is enabled automatically when `boto3` is installed.

## JavaScript

Version 11.13.0 of the Sentry JavaScript SDK records prompts, system instructions, tool definitions and responses on Bedrock spans, as the other AI integrations do. This applies to the `Converse`, `ConverseStream`, `InvokeModel` and `InvokeModelWithResponseStream` commands. Since 11.12.0, Bedrock spans also report correct token usage, including prompt-cache tokens.

The `awsIntegration` is enabled automatically when `@aws-sdk/client-bedrock-runtime` is used. To stop recording prompts or responses only for Bedrock, set its options:

```js
Sentry.init({
  integrations: [Sentry.awsIntegration({ recordInputs: false, recordOutputs: false })],
});
```
