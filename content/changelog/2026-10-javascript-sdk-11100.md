---
title: "JavaScript SDK 11.10.0: Cloudflare Clairic spans and managed tunnel"
slug: javascript-sdk-11100-managed-tunnel-clairic
summary: The JavaScript SDKs now record Cloudflare Clairic calls as extraction spans, and send events through a tunnel path derived from your DSN.
categories:
  - SDK
  - AI
platform:
  - javascript
  - javascript-astro
  - javascript-nuxt
  - javascript-react-router
  - javascript-remix
  - javascript-solidstart
  - javascript-sveltekit
  - javascript-tanstackstart-react
  - node
  - node-cloudflare-workers
  - node-cloudflare-pages
broadcastCategory: sdk_update
published: true
date: 2026-10-28
author: andrei.borza@sentry.io
---

Version 11.10.0 of the Sentry JavaScript SDKs records Cloudflare Clairic calls as AI extraction spans, and adds a managed tunnel that keeps your events away from ad blockers.

## Clairic calls as extraction spans

Calls to the Cloudflare Clairic model (`@cf/cloudflare/clairic`) through Workers AI now create `gen_ai.extract` spans. Each span records the input and output, the response model, and token usage. In the trace view, the Extraction tab highlights each extracted value in the source text. Hover a value to see the field it belongs to.

![A gen_ai.extract span for Cloudflare Clairic in the Sentry trace view, with the source text and the extracted invoice fields](/img/changelog/2026-10-javascript-sdk-11100-clairic.jpeg)

`@sentry/cloudflare` instruments the Workers AI binding automatically, so you do not need to change your code.

## Send events through your own server with `tunnel: true`

Ad blockers often block requests to Sentry, so you lose errors and traces from some of your users. A tunnel sends the events through your own server first.

Set `tunnel: true` in the browser SDK. The SDK derives the tunnel path from your DSN, so your browser and server builds always agree on the path, also during a deploy.

```ts
// browser
Sentry.init({ dsn, tunnel: true });

// server
Sentry.init({ dsn, integrations: [Sentry.serveTunnelIntegration()] });
```

With `serveTunnelIntegration()`, Astro, Nuxt, Nitro, React Router, Remix 3, SolidStart, SvelteKit and TanStack Start answer tunnel requests automatically. For other servers, use `handleTunnelRequestIfMatched` from your server SDK:

```ts
app.use((req, res, next) => Sentry.handleTunnelRequestIfMatched(req, res) ?? next());
```

If your browser uses a different DSN than your server, add it with `serveTunnelIntegration({ allowedDsns: [browserDsn] })`.

This release also instruments Cloudflare Workers KV bindings and together-ai, makes `sentryBunPlugin` upload source maps, adds experimental support for the Nuxt Vite server, and fixes AI SDK, OpenAI, Anthropic and LangChain spans. See the [release notes](https://github.com/getsentry/sentry-javascript/releases/tag/11.10.0) for all changes.
