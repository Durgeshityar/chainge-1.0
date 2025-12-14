---

change-id: add-ts-eslint-config
title: Design notes and trade-offs

## Goals

- Keep implementation minimal and non-intrusive to existing code.
- Provide a clear path for future CI integration and adding/removing path aliases.

## Design decisions

- Path aliases: use `@/` mapping to the repo root so imports like `@/components` are
  resolved consistently. This mirrors the codebase's current usage in `TASKS.md`.
- Strict TypeScript: enable `strict` to catch bugs early. If the codebase has
  many existing type errors, the team can adopt `--skipLibCheck` and incrementally
  fix issues.
- ESLint + Prettier: use ESLint for code-quality rules and Prettier purely for
  formatting. `eslint-config-prettier` is configured to avoid rule conflicts.

## Trade-offs

- Enabling `strict` may cause a large number of initial type errors; the
  recommended strategy is to enable the flags and then address errors by file or
  with `// @ts-ignore` selectively during migration.
- Adding ESLint dependencies increases dev setup time; it's a one-time cost but
  benefits long-term consistency.

## Developer flow

- To validate locally:
  1. `npm install` (ensure dev deps installed)
  2. `npm run lint` to see lint warnings/errors
  3. `npm run lint:fix` to auto-fix where possible
  4. `npm run format` to apply Prettier
  5. `npx tsc -p tsconfig.json --noEmit` to validate types

## Maintenance notes

- When adding new path aliases, update `tsconfig.json`, `babel.config.js` (if
  relevant), and Metro resolver for React Native if runtime resolution is used.
