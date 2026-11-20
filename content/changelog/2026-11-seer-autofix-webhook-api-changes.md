---
title: "Upcoming changes to Seer Autofix webhooks and API"
slug: seer-autofix-webhook-api-changes
summary: Autofix will find the root cause and can write the fix and open a PR in one run, without separate steps. If you use Seer webhooks or the Autofix API, some events and fields change.
categories:
  - AI
  - API
  - INTEGRATIONS
broadcastCategory: announcement
published: true
---

We're moving organizations to a new Autofix flow. Instead of separate root cause, plan, and code steps, one run finds the root cause. If **Enable Code Generation** is on, the same run writes the fix and can open a PR. When Autofix isn't confident, it stops early and says why.

If you use Autofix only in Sentry, you don't need to do anything. If you use Seer webhooks or the Autofix API, here's what changes once your organization moves.

## Webhooks

- Sentry no longer sends `seer.solution_started`, `seer.solution_completed`, or `seer.coding_started`.
- `one_line_description`, `five_whys`, and `reproduction_steps` in `seer.root_cause_completed` are deprecated. `five_whys` and `reproduction_steps` are sent empty.
- `seer.root_cause_completed` adds `cause`, the full explanation of the root cause. It no longer includes `relevant_repo`.
- Sentry can send `seer.root_cause_completed` more than once per run. Treat the latest one as current.
- A run that stops before it finds a root cause doesn't send `seer.root_cause_completed`. Check [`seer.stopped`](https://docs.sentry.io/integrations/integration-platform/webhooks/seer/#stopped) for why.
- A run that opens a PR sends both `seer.coding_completed` and `seer.pr_created`.

Today, the `root_cause` object in `seer.root_cause_completed` looks like this:

```json
"root_cause": {
  "headline": "Checkout crashes when the cart is empty",
  "one_line_description": "cart.total is read before the cart is loaded",
  "five_whys": ["...", "..."],
  "reproduction_steps": ["...", "..."],
  "relevant_repo": "acme/web"
}
```

After we remove the deprecated fields, it will be:

```json
"root_cause": {
  "headline": "Checkout crashes when the cart is empty",
  "cause": "cart.total is read in render() before loadCart() resolves, so ..."
}
```

## Autofix API

These changes apply to `/api/0/organizations/{organization_id_or_slug}/issues/{issue_id}/autofix/`.

- **Reading a run:** the root cause has `headline`, `cause`, and `relevant_repos`, a list of `owner/name` strings. `one_line_description`, `five_whys`, `reproduction_steps`, and `relevant_repo` are removed, and there's no plan. The `?llmFormat=markdown` export changes the same way.
- **Starting a run:** if you don't send `stopping_point`, the run writes code changes but doesn't open a PR. Before, it stopped at the root cause. Send `"stopping_point": "root_cause"` to keep the old behavior.
- **Continuing a run:** sending `step` as `root_cause`, `solution`, or `code_changes` with a `run_id` returns `404`. Set `stopping_point` when you start the run instead.

## Coming later

We'll remove these items:

- `one_line_description`, `five_whys`, and `reproduction_steps` from `seer.root_cause_completed`
- The `seer.solution_started` and `seer.solution_completed` event types
- The **Stop after Plan** option

We'll announce the dates in a new changelog post at least 30 days before we remove them.
