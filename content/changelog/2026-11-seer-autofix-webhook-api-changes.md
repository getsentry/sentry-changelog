---
title: "Upcoming changes to Seer Autofix webhooks and API"
slug: seer-autofix-webhook-api-changes
summary: Autofix will find the root cause, write the fix, and open a PR in one run, without separate steps. If you use Seer webhooks, the Autofix API, or the Sentry CLI, some events and fields change.
categories:
  - AI
  - API
  - INTEGRATIONS
broadcastCategory: announcement
published: true
---

We're moving organizations to a new Autofix flow. Instead of separate root cause, plan, and code steps, one run finds the root cause. If **Enable Code Generation** is on, the same run writes the fix and can open a PR. When Autofix isn't confident, it stops early and says why.

If you use Autofix only in Sentry, you don't need to do anything. If you use Seer webhooks, the Autofix API, or the Sentry CLI, here's what changes once your organization moves.

## Webhooks

- `seer.solution_started`, `seer.solution_completed`, and `seer.coding_started` are no longer sent.
- `one_line_description`, `five_whys`, and `reproduction_steps` in `seer.root_cause_completed` are deprecated. `five_whys` and `reproduction_steps` are sent empty.
- `seer.root_cause_completed` adds `cause`, which explains the root cause, and no longer sends `relevant_repo`.
- `seer.root_cause_completed` can be sent more than once per run. Treat the latest one as current.
- A run that stops before it finds a root cause doesn't send `seer.root_cause_completed`. Check [`seer.stopped`](https://docs.sentry.io/integrations/integration-platform/webhooks/seer/#stopped) for why.
- A run that opens a PR sends both `seer.coding_completed` and `seer.pr_created`.

For example, the `root_cause` object in `seer.root_cause_completed` today:

```json
"root_cause": {
  "headline": "Checkout crashes when the cart is empty",
  "one_line_description": "cart.total is read before the cart is loaded",
  "five_whys": ["...", "..."],
  "reproduction_steps": ["...", "..."],
  "relevant_repo": "acme/web"
}
```

And after your organization moves, without the deprecated fields:

```json
"root_cause": {
  "headline": "Checkout crashes when the cart is empty",
  "cause": "cart.total is read in render() before loadCart() resolves, so ..."
}
```

## Autofix API

For `/api/0/organizations/{organization_id_or_slug}/issues/{issue_id}/autofix/`:

- **Reading a run:** the root cause has `headline`, `cause`, and `relevant_repos` (a list). `one_line_description`, `five_whys`, `reproduction_steps`, and `relevant_repo` are gone, and there's no plan. The `?llmFormat=markdown` export changes the same way.
- **Starting a run:** if you leave out `stopping_point`, a run now goes as far as code changes (without opening a PR) instead of stopping at the root cause. The project's automation setting doesn't apply to API runs. Send `"stopping_point": "root_cause"` to keep the old behavior.
- **Continuing a run:** sending `step` as `root_cause`, `solution`, or `code_changes` with a `run_id` returns `404`. Set `stopping_point` when you start the run instead.

## Settings and the CLI

- If your Autofix automation settings list both **Stop after Plan** and **Stop after Code Changes**, projects set to **Stop after Plan** now stop at the root cause.
- `sentry issue plan` and `sentry issue explain` need a Sentry CLI release newer than 0.50.0.

## Coming later

We'll remove `one_line_description`, `five_whys`, and `reproduction_steps` from `seer.root_cause_completed`, the `seer.solution_*` event types, and the **Stop after Plan** option. We'll post the date here at least 30 days before.
