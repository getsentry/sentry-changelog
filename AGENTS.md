# Agent Instructions

## Package Manager
Use **pnpm** (v10.27.0, Node 22.x via Volta)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Generate Prisma client + build |
| `pnpm test:run` | Run tests (vitest) |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Autofix lint issues |

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Commit Convention
Follow conventional commits matching existing history:
- `feat:` / `fix:` / `build:` / `ci:` / `fix(deps):` / `build(deps):`
- Include scope where relevant (e.g., `deps`, `auth`)

## Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Prisma (PostgreSQL)
- **Styling:** Tailwind CSS + Sass + Radix UI Themes
- **Linting:** Biome (not ESLint/Prettier)
- **Testing:** Vitest
- **Monitoring:** Sentry (`@sentry/nextjs`)
- **CMS:** Contentful
- **Auth:** NextAuth.js v4
- **Hosting:** Vercel

## Pre-commit Hooks
`simple-git-hooks` runs `lint-staged` → Biome check on staged files. Do not skip with `--no-verify`.

## Key Conventions
- Pinned deps documented in `package.json` `"//"` field — check before bumping
- Avoid `pnpm.overrides` for transitive deps — bump the parent instead

## Telemetry
- Sentry org `sentry`, project `changelog`
- `environment` is the Vercel environment (`production`, `preview`), or `development` locally
- `release` is the deployed git commit SHA
- Web vitals (LCP, CLS, INP) are reported for page loads and soft navigations; soft navigation vitals are Chromium-only

## Security Vulnerabilities
Use `fix-security-vulnerability` skill. See `.claude/skills/fix-security-vulnerability/SKILL.md`
