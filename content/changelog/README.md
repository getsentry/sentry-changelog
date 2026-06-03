# Authoring changelog entries via pull request

This directory lets anyone propose a changelog entry through a normal GitHub
pull request. It's an alternative to the admin UI at `/changelog/_admin` —
both write to the same database, so use whichever you prefer.

## How it works

1. Add a Markdown file to `content/changelog/`, e.g.
   `2026-06-improved-traces.md`. Copy [`_template.md`](./_template.md) as a
   starting point.
2. Open a pull request. CI validates the frontmatter of every entry and fails
   with a clear message if something is wrong.
3. A maintainer reviews and merges to `main`.
4. On merge, the **Sync Changelog** GitHub Action upserts the file into the
   database (keyed by `slug`). The entry goes live if `published: true`.

Editing an existing entry is the same flow: change the file (keep the same
`slug`) and open a PR. The sync overwrites the matching database row.

## File format

Each file is YAML frontmatter followed by a Markdown/MDX body:

```markdown
---
title: Improved Traces
slug: improved-traces
summary: Traces now load 2x faster and show span details inline.
categories:
  - Performance
published: true
date: 2026-06-03
---

## What changed

Body content here…
```

| Field        | Required | Notes                                                                 |
| ------------ | -------- | --------------------------------------------------------------------- |
| `title`      | yes      | Post title.                                                           |
| `slug`       | no       | Kebab-case, unique. Defaults to the filename. This is the public URL. |
| `summary`    | no\*     | Used in listings, search, RSS, and social previews. Recommended.     |
| `image`      | no       | Hero image URL or path.                                              |
| `categories` | no       | List of strings; created automatically if new.                       |
| `published`  | no       | Defaults to `false`. Set `true` to go live.                           |
| `date`       | no       | `YYYY-MM-DD`. Controls ordering. Defaults to merge date if published. |
| `author`     | no       | Email of an existing user to attribute.                               |
| `deleted`    | no       | Set `true` to unpublish/soft-delete while keeping the file as a record. |

Files starting with `_` (like `_template.md`) or `.` are ignored.

## Validate locally

```bash
pnpm changelog:validate
```

## The admin UI wins

The admin UI is the primary editing surface, so it takes priority over files:

- **As soon as an entry is touched in the admin UI** (created, edited,
  published, or unpublished), it becomes _admin-managed_ and the sync stops
  overwriting it. Later changes to its file are **ignored** (and noted in the
  sync log as `skipped — admin-managed`).
- To keep editing an entry through PRs, don't edit it in the UI. Once someone
  does, move further changes to the UI too.
- A brand-new file still **creates** the entry; ownership only flips to the UI
  after the first UI edit.

## Notes

- The slug is the source of identity. Renaming a file is fine; **changing the
  slug** creates a new entry rather than editing the old one.
- This sync only touches entries that exist as files here. Posts created only
  through the admin UI are never modified or deleted by the sync.
