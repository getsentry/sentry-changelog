---
title: Python SDK 3.0
slug: python-sdk-v3
summary: Version 3 of the Sentry Python SDK is out, bringing streamlined tracing API and granular data collection.
categories:
  - SDK
platform:
  - python
broadcastCategory: sdk_update
published: false
date: 2026-11-23
author: ivana.kellyer@sentry.io
---

Version 3.0.0 of the Sentry Python SDK is now available.

This is a major release with breaking changes. Read the [migration guide](https://docs.sentry.io/platforms/python/migration/2.x-to-3.x/) before you upgrade.

## New Features

- ✨ **Polished and simplified tracing API**, backed by span streaming. There are no transactions anymore. `sentry_sdk.start_span()` is all you need.
- 🕶️ **Granular control over what gets sent** with `data_collection`. Instead of a single `send_default_pii` toggle, you can pick what exactly the SDK should collect and how.
- ☁️ **AWS Lambda and boto3 instrumentation has been improved**, with Lambda trigger detection, trace propagation through SQS and SNS, and support for more AWS services.

## Breaking Changes

- The organically-grown custom tracing API [has changed](https://docs.sentry.io/platforms/python/migration/2.x-to-3.x#tracing). There is no `start_transaction` or `start_child` anymore. Everything can be done via the `start_span` API.
- We've [removed most extras](https://docs.sentry.io/platforms/python/migration/2.x-to-3.x#installation-extras). Install `sentry-sdk` instead of `sentry-sdk[fastapi]`, for example. The extras that we removed didn't have any effect.
- Our logging integrations (standard library logging and Loguru) are [not enabled by default anymore, and their options have changed](https://docs.sentry.io/platforms/python/migration/2.x-to-3.x#logging-and-loguru).

## How to Upgrade

- [2.x to 3.x migration guide](https://docs.sentry.io/platforms/python/migration/2.x-to-3.x/) in the Sentry docs
- [Detailed list of changes](https://github.com/getsentry/sentry-python/blob/master/MIGRATION_GUIDE.md#sentry-sdk-30-migration-guide) in the repo
- [Release notes](https://github.com/getsentry/sentry-python/releases/tag/3.0.0)
