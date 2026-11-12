---
title: Issue view API endpoints now accept org:read
slug: issue-views-accept-org-read
summary: Every issue view API endpoint now accepts tokens with the org:read scope. Issue views are shared across an organization, so they now need the same scope as other organization data.
categories:
  - API
broadcastCategory: announcement
published: false
author: dominik.buszowiecki@sentry.io
---

Issue views are shared across your organization. Even so, several issue view endpoints only accepted `member:read`, while the issue view details endpoint required `org:read`. A token that could read one issue view endpoint couldn't always read the others.

## What changed

These endpoints now accept `org:read`, in addition to the scopes they already accepted:

- `GET` and `POST` `/api/0/organizations/{organization_id_or_slug}/group-search-views/`
- `GET` `/api/0/organizations/{organization_id_or_slug}/group-search-views/starred/`
- `PUT` `/api/0/organizations/{organization_id_or_slug}/group-search-views/starred/order/`
- `POST` `/api/0/organizations/{organization_id_or_slug}/group-search-views/{view_id}/starred/`
- `POST` `/api/0/organizations/{organization_id_or_slug}/group-search-views/{view_id}/visit/`

The issue view details endpoint, `/api/0/organizations/{organization_id_or_slug}/group-search-views/{view_id}/`, already accepted `org:read` and hasn't changed.

## Do I need to do anything?

No. Tokens that already work with these endpoints keep working. Tokens with `org:read` can now call all of them.
