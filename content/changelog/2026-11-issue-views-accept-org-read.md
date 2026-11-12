---
title: Issue views list endpoint now accepts org:read
slug: issue-views-accept-org-read
summary: The endpoint that lists and creates issue views now accepts tokens with the org:read scope, matching the issue view details endpoint.
categories:
  - API
broadcastCategory: announcement
published: false
author: dominik.buszowiecki@sentry.io
---

Issue views are shared across your organization. Even so, the endpoint that lists and creates them only accepted `member:read`, while the issue view details endpoint required `org:read`. A token that could read one endpoint couldn't always read the other.

## What changed

`GET` and `POST` `/api/0/organizations/{organization_id_or_slug}/group-search-views/` now accept `org:read`, in addition to the scopes they already accepted.

The issue view details endpoint, `/api/0/organizations/{organization_id_or_slug}/group-search-views/{view_id}/`, already accepted `org:read` and hasn't changed. Starring, reordering starred views and recording visits store per-user preferences, so their scopes haven't changed either.

## Do I need to do anything?

No. Tokens that already work with this endpoint keep working. Tokens with `org:read` can now call it too.
