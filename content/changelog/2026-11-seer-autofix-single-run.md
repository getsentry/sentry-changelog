---
title: "Seer Autofix is moving to a single run: upcoming changes to webhooks and the API"
slug: seer-autofix-single-run
summary: Autofix will find the root cause, write the fix and open a PR in a single run instead of separate steps. Over the coming weeks, organizations move to the new flow, which changes some Seer webhooks, the Autofix API and the "Plan" setting.
categories:
  - AI
  - API
  - INTEGRATIONS
broadcastCategory: announcement
published: true
date: 2026-11-18
---

Over the coming weeks, organizations will be gradually moved to a new Autofix flow. Instead of separate root cause, plan and code steps, a single run finds the root cause and, if your settings allow, writes the fix and opens a PR. When it isn't confident, it stops early and explains why.

If you only use Autofix in Sentry, there's nothing to do. If you integrate with Autofix through webhooks, the API or the CLI, here's what changes once your organization is moved.

## Webhooks

- `seer.solution_started`, `seer.solution_completed` and `seer.coding_started` are no longer sent.
- In `seer.root_cause_completed`, `five_whys` and `reproduction_steps` are empty arrays and `relevant_repo` is omitted. A new `headline` field is added, and `one_line_description` is still sent.
- A run that stops before finding a root cause sends no `seer.root_cause_completed`.
- A run that opens a PR sends both `seer.coding_completed` and `seer.pr_created`.

## Settings and automations

- Projects whose Autofix automation stops at "Plan" now stop at the root cause.
- The "Planning completed" automation trigger no longer fires.

## Autofix API

In `GET /api/0/organizations/{organization_id_or_slug}/issues/{issue_id}/autofix/`, the root cause has `headline` and `cause` instead of `one_line_description`, `five_whys` and `reproduction_steps`, and there is no plan. The `?llmFormat=markdown` export no longer includes the five whys, reproduction steps or plan, and is the most stable way to read a run.

Continuing a run one step at a time (`POST` to the same endpoint with `step` and `run_id` or `sentry_run_id`) doesn't work for runs on the new flow. To control how far a run goes, set `stopping_point` when you start it.

## CLI and MCP

- `sentry issue plan` no longer works, since runs have no plan step.
- The Sentry MCP server needs no changes.

## Later: removing deprecated fields

`five_whys` and `reproduction_steps` will later be removed from the `seer.root_cause_completed` payload. We'll post the date here at least 30 days in advance.
