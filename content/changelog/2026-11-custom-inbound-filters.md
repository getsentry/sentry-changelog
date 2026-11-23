---
title: "Drop noisy data with more precision using Custom Inbound Filters"
slug: custom-inbound-filters
summary: "Build your own custom inbound filters using more flexible conditions to drop incoming data before it counts toward your quota."
categories:
  - Data Management
broadcastCategory: feature
published: true
date: 2026-11-23
---

Build your own inbound filters to drop errors, logs, metrics, and spans before they count toward your quota, combining different and new conditions.

![The Custom Inbound Filters table in the project settings, with the conditions of each filter and the amount of data it dropped](/img/changelog/2026-11-custom-inbound-filters.png)

In **Project Settings > Inbound Filters**, click **Add Filter** and type your conditions. Sentry drops anything that matches all of them at ingest. For example:

- `error_type:TypeError release:<2.0.0` drops one TypeError from old releases
- `log_message:*DEBUG*` drops debug logs
- `ip_address:10.0.0.0/8` drops internal traffic

Custom inbound filters are available on Business and Enterprise plans. Learn more in our [docs](https://docs.sentry.io/concepts/data-management/filtering/#custom-filters).
