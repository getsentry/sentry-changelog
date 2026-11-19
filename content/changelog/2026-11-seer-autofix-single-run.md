---
title: "Seer Autofix is moving to a single run"
slug: seer-autofix-single-run
summary: Autofix will find the root cause, write the fix and open a PR in one run instead of separate steps. If you use Seer webhooks, the Autofix API or the CLI, some fields and events change.
categories:
  - AI
  - API
  - INTEGRATIONS
broadcastCategory: announcement
published: true
date: 2026-11-18
---

Over the coming weeks, we'll move organizations to a new Autofix flow. Instead of separate root cause, plan and code steps, one run finds the root cause and, if your settings allow it, writes the fix and opens a PR. When it isn't confident, it stops early and says why.

If you only use Autofix in Sentry, there's nothing to do. If you build on it, here's what changes once your organization moves.

## Webhooks

- `seer.solution_started`, `seer.solution_completed` and `seer.coding_started` are no longer sent.
- `seer.root_cause_completed` adds `headline` and `cause` fields. `one_line_description` now holds the headline, `five_whys` and `reproduction_steps` are empty, and `relevant_repo` is omitted.
- A run that stops before finding a root cause doesn't send `seer.root_cause_completed`.
- A run that opens a PR sends both `seer.coding_completed` and `seer.pr_created`.

## Autofix API

For `/api/0/organizations/{organization_id_or_slug}/issues/{issue_id}/autofix/`:

- **Reading a run:** the root cause has `headline` and `cause` instead of `one_line_description`, `five_whys` and `reproduction_steps`, and there's no plan. The `?llmFormat=markdown` export changes the same way.
- **Starting a run:** without a `stopping_point`, a run now goes as far as code changes (without opening a PR) instead of stopping at the root cause. Pass `stopping_point: root_cause` to keep the old behavior.
- **Continuing a run step by step** (`step` with `run_id` or `sentry_run_id`) no longer works. Set `stopping_point` when you start the run instead.

## Settings and the CLI

- Projects with Autofix automation set to stop at "Plan" now stop at the root cause.
- `sentry issue plan` no longer works. The Sentry MCP server needs no changes.

## Coming later

We'll remove `five_whys` and `reproduction_steps` from `seer.root_cause_completed`, and post the date here at least 30 days in advance.
