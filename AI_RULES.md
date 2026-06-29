# AI Project Rules

## Read this first

Every AI agent, coding assistant, developer, Codex, Claude, Cline, Antigravity or other tool must read this file before editing, auditing, refactoring or developing this website.

## Core rule

Do not overwrite messy code on top of old code.

This project must stay clean, maintainable and free of legacy junk.

When rebuilding or changing any feature, layout, component, style or logic, remove the old unused implementation after the new one is complete.

## Before editing

Before writing new code:

1. Read all related files.
2. Identify old code, duplicated logic, unused components, unused CSS, unused imports and dead files.
3. Decide whether to refactor, replace or remove.
4. Implement the clean solution.
5. Delete obsolete code.
6. Audit the final result.

## Do not leave behind

Do not leave behind:

- Dead code
- Unused components
- Unused functions
- Unused imports
- Unused exports
- Duplicate CSS
- Duplicate layouts
- Duplicate business logic
- Old versions of replaced features
- Temporary patch code
- Comments like `old code`, `legacy`, `remove later`, or `temporary fix` unless strictly necessary

## Do not keep two versions

Do not keep both old and new versions of the same feature unless there is a clear technical reason.

If a feature is migrated, remove the old implementation.

If a component is replaced, delete the old component if nothing uses it.

If CSS is rewritten, remove the obsolete classes.

## Be careful with protected files

Do not delete or rewrite these without strong reason and explicit understanding:

- `.env`
- Deployment config
- Database files
- Migrations
- Production configuration
- Customer content
- Real media files
- Brand assets
- Logos
- Payment configuration
- Email configuration
- Analytics or tracking configuration

Only remove technical code that is confirmed unused, obsolete or duplicated.

## Required checklist after every change

Before finishing any task, verify:

- No unused imports
- No unused exports
- No dead components
- No duplicate logic
- No obsolete CSS
- No old implementation left behind
- No temporary patch unless documented
- No unnecessary new files
- Website remains clean and maintainable

## Final standard

Clean website.
Clean codebase.
No legacy junk.
No messy overwrite.
No duplicated old/new code.
No dead code.
No careless deletion.

## Liên quan

- [`CLAUDE.md`](CLAUDE.md) — luật tổng cho mọi agent.
- [`AGENTS.md`](AGENTS.md) — chuẩn SEO, quality gate, image SEO.
