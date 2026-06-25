---
# Required. Shown as the post title.
title: My Changelog Entry

# Optional. Defaults to the filename (without extension).
# Must be kebab-case and unique across all entries. This is the public URL:
#   https://sentry.io/changelog/<slug>
slug: my-changelog-entry

# Optional but recommended. One- or two-sentence summary used in listings,
# search, RSS, and social previews.
summary: A short description of what changed and why it matters.

# Optional. Absolute URL or path to the hero image.
image: https://example.com/hero.png

# Optional. Category tags. Created automatically if they don't exist yet.
categories:
  - Performance
  - Web

# Optional. Platform slugs to scope this entry (e.g. "javascript-react",
# "python-django"). Mirrors getsentry's broadcast targeting dropdown.
# Leave empty (or omit) to show to all platforms.
# Valid slugs are defined in src/lib/platforms.ts.
platform:
  - javascript-react

# Optional. Controls the label pill in Sentry's "What's New" broadcast panel.
# Valid values: announcement, feature, sdk_update
# Defaults to "feature" (New Feature) when omitted or null.
# broadcastCategory: announcement

# Optional. Defaults to false. Set to true to make the entry live.
published: false

# Optional. Publish date (YYYY-MM-DD). If omitted on a published entry,
# the merge date is used. Set this to control ordering.
date: 2026-06-03

# Optional. Email of an existing user to attribute as author.
author: you@sentry.io
---

Write the body here as Markdown / MDX. Headings become the table of contents.

## What changed

- Bullet points work
- So do `code spans`, [links](https://sentry.io), and images

```ts
// fenced code blocks are syntax-highlighted
console.log("hello");
```
