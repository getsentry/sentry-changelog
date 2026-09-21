---
title: Seer can now iterate on its own pull requests
slug: seer-pr-iteration
summary: Leave review feedback on a PR Seer opened and it'll push updates to address it — no need to start over or open a new PR.
categories:
  - AI
broadcastCategory: feature
published: false
date: 2026-09-21
author: peter.mccarron@sentry.io
---

Seer, Sentry's AI debugging agent, can now iterate on pull requests it opens as part of Autofix.

Previously, once Seer opened a PR with a proposed fix, getting changes meant re-running Autofix and starting a new PR. Now you can leave review comments directly on Seer's PR, and Seer will read the feedback, update its fix, and push new commits to the same PR — keeping the conversation and history in one place.

## What's new

- **Respond to review comments** — Leave a comment on Seer's PR describing what should change, and Seer will push an update addressing it.
- **Same PR, no restarts** — Iterations land as new commits on the existing PR instead of creating a new one each time.

Learn more in the [Autofix documentation](https://docs.sentry.io/product/ai-in-sentry/seer/autofix/#pr-iteration).
