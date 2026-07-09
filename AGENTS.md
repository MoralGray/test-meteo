# AGENTS.md

## Project overview

Monorepo (nx v22, npm workspaces) with 4 packages:

| Package | Path | What it is |
|---|---|---|
| `mg-weather` | `apps/mg-weather` | React 19 + Vite 8 frontend (port 3006) |
| `mg-weather-backend` | `apps/mg-weather-backend` | NestJS 11 + Prisma 7 backend (port 8008) |
| `@mg-nx-forge/mg-api-axios-1` | `packages/mg-api-axios-1` | Shared Axios API client |
| `@mg-nx-forge/mg-ui-shadcn-4` | `packages/mg-ui-shadcn-4` | Shared shadcn/ui components |

External API: Open-Meteo (free, no key).

## Setup

- Node >=22.12 <24, managed via `mise` (see `mise.toml`).
- `npm install` at root installs all workspaces.
- Env vars come from `mise.toml` (`MG_WEATHER_PORT=3006`, `MG_WEATHER_BACKEND_PORT=8008`, `DB_PROVIDER=sqlite`). Backend also reads `apps/mg-weather-backend/.env`.
- SQLite dev DB is checked in at `apps/mg-weather-backend/prisma/dev.db`. To sync schema: `npm exec nx run mg-weather-backend:db:push`.

## Dev workflow

Start both apps in parallel:
```
mise run all
```
Or individually:
```
npm exec nx run mg-weather:dev      # frontend on :3006
npm exec nx run mg-weather-backend:dev  # backend on :8008
```

Vite proxies `/api` to the backend (see `apps/mg-weather/vite.config.ts`).

## Verification pipeline

Run before committing: `npm run check` (Biome lint+format + all typechecks).

Other commands:
- `npm run test:all` — nx runs tests for projects with a test target (currently only backend)
- `npm run lint:all` / `npm run typecheck:all` — per-target across all projects
- Single app: `npm exec nx run <project>:<target>` (e.g. `mg-weather:typecheck`)

## Toolchain quirks

- **Biome** — linter + formatter. 4-space indent, single quotes, 120 width. Config at `biome.json`.
- **Tailwind v4** — CSS-first, no `tailwind.config.js`. Directives in `index.css` / `global.css`.
- **Prisma** — default SQLite. Switch to PostgreSQL by setting `DB_PROVIDER=postgresql` and updating `DATABASE_URL` in `.env`.
- **Path aliases** in frontend: `@/*` -> `apps/mg-weather/src/*`, `@mg-nx-forge/*` -> `packages/*/src/index.ts`.
- **Nx cache** at `.nx/` — delete if stale.

## Conventions (must follow)

### UI components

Use only shadcn/ui from `@/components/ui/<name>` (or from `@mg-nx-forge/mg-ui-shadcn-4`). Never use bare HTML elements for headings, text, tables, or code.

### Typography

| HTML | Use instead |
|---|---|
| `<h1>` through `<h4>` | `<TypographyH1>` through `<TypographyH4>` |
| `<p>` | `<TypographyP>` |
| `<blockquote>` | `<TypographyBlockquote>` |
| `<table>` | `<TypographyTable>` |
| `<ul>` / `<ol>` | `<TypographyList>` |
| `<code>` | `<TypographyInlineCode>` |
| lead / large / small / muted | `<TypographyLead>` / `<TypographyLarge>` / `<TypographySmall>` / `<TypographyMuted>` |

### Code comments

```ts
// single-line for inline notes

// # ==========================================================================
// # main section header
// # ==========================================================================

// # ------------------------------------------------------------------
// # subsection header
// # ------------------------------------------------------------------

// short label
```

## Testing

- Backend: Vitest v4 (`npm exec nx run mg-weather-backend:test`).
- Frontend: no tests yet.
- No CI, no pre-commit hooks.

## Nuances

- Icon system in `mg-ui-shadcn-4` uses a registry loader (Lucide/Tabler/Phosphor/Hugeicons). Check `src/registry/icons/` before adding new icon deps.
- `axios` version pinned via root `overrides` to 1.16.0.
- `useExhaustiveDependencies` is off in Biome — don't add eslint-plugin-react-hooks.

## TODO.md — detailed rules

### Purpose

Track project-wide tasks and epic plans in `TODO.md` at repo root.

### Epic structure

- Keyword-based epics: `## epic-keyword | Description` (e.g. `## epic-auth | NestJS Core Authentication and Multi-tenancy`)
- Each epic has 4 to 15 items depending on scope
- Epics are independent, no overlap
- Do not work on an epic unless asked
- Do not modify tasks or epics unless explicitly requested

### Style guide

- Heading levels allowed: `#`, `##`, `###` only
- Section titles: `#`
- Epics: `##`
- No bold, italics, code ticks, links, or other markdown
- Lists: only `-` (hyphen) items
- No `- [ ]` or `- [x]` checkboxes
- Done items: insert `[DONE]` immediately after the prefix
  - Examples: `- [DONE] text`, `- - [DONE] text`
- Do not change original item text except to add `[DONE]`
- Do not add `[DONE]` to titles (`#`, `##`, `###`)

### Important moments

- Do not change linter settings
- Do not change how project commands run
- Do not build project – only run lint
- Run all commands with `timeout`
- If user mentions `TODO.md` and work involves its tasks/epics, update `TODO.md` to reflect current state

## Documentation (DOCS.md) — detailed structure

Project docs follow the `{project-name}.DOCS.md` convention at repo root.

### Structure
- `# Title` — H1 with project name
- `## Concept` — Bilingual overview (Russian Концепт + English Project Overview)
- `## Architecture` — Frontend/backend/data-flow with ASCII diagrams
- `## Features` — Structured feature list
- `## API Reference` — Endpoints grouped by controller
- `## Database Schema` — Table descriptions
- `## State Management` — Stores and storage keys

### Feature entry format
```markdown
### Feature: Title
- ID: F-XXX
- Status: Done | Planned
- Description
- - Item
- User Flow
- - Item
- Technical Notes
- - Item
- Test Spec
- - Navigate to /
- - Verify result
```

### Conventions
- English headings, Russian concept section optional
- Feature IDs sequential: F-001, F-002...
- ASCII diagrams for pipeline/data flows
- Tables for structured data (ports, commands, endpoints)
- HTML comments (`<!---->`) as separators
- Future ideas as unordered list at bottom
