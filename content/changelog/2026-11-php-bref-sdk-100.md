---
title: "Bref SDK 1.0.0: PHP on AWS Lambda"
slug: php-bref-sdk-100-aws-lambda
summary: The new Sentry integration for Bref reports AWS Lambda timeouts, event handler failures, cold starts, and AWS SDK calls in PHP applications.
categories:
  - SDK
  - Integrations
platform:
  - php
  - php-laravel
  - php-symfony
broadcastCategory: sdk_update
published: true
date: 2026-11-18
author: johannes.daxboeck@sentry.io
---

[Bref](https://bref.sh) runs PHP applications on AWS Lambda. Version [1.0.0](https://github.com/getsentry/sentry-bref/releases/tag/1.0.0) of the new [`sentry/sentry-bref`](https://github.com/getsentry/sentry-bref) integration reports what the Sentry SDK can't see on AWS Lambda:

- **Timeouts and oversized responses**: Requests that time out or return more than the 6 MB limit of AWS Lambda fail outside of PHP-FPM. The integration reports them with the URL and method of the request. This works with Laravel and Symfony.
- **Event handlers**: Each SQS, EventBridge, or S3 invocation gets its own transaction and scope, and the exceptions thrown by the handler are reported.
- **Cold starts**: Requests and events that trigger a cold start get `lambda.cold-start` and `bref.startup` spans.
- **AWS SDK calls**: Calls of the clients you pass to `AwsSdkTracer::trace()` become spans and breadcrumbs, like `SQS.SendMessage`.
- **CloudWatch logs**: Every event links to the CloudWatch logs of its invocation.

The integration requires PHP 8.2 or later and Bref 3. Install it with Composer:

```bash
composer require sentry/sentry-bref
```

With Laravel, that's it. With Symfony, register `Sentry\Bref\Symfony\BrefSentryBundle` in `config/bundles.php`. For other frameworks and all options, read the [Bref guide](https://docs.sentry.io/platforms/php/guides/bref/).
