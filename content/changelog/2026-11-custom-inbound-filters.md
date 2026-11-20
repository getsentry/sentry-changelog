---
title: "Drop noisy data with custom inbound filters"
slug: custom-inbound-filters
summary: "Build your own inbound filters to drop errors, logs, metrics, and spans before they count toward your quota."
categories:
  - Data Management
broadcastCategory: feature
published: true
---

Build your own inbound filters to drop errors, logs, metrics, and spans before they count toward your quota.

In **Project Settings > Inbound Filters**, click **Add Filter** and type your conditions. Sentry drops anything that matches all of them at ingest. For example:

- `error_type:TypeError release:<2.0.0` drops one TypeError from old releases
- `log_message:*DEBUG*` drops debug logs
- `ip_address:10.0.0.0/8` drops internal traffic

Custom inbound filters are available on Business plans. Learn more in our [docs](https://docs.sentry.io/concepts/data-management/filtering/#custom-filters).
