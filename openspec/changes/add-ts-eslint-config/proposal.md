---
change-id: add-ts-eslint-config
title: Configure TypeScript strict paths and ESLint/Prettier
summary: |
  Add project TypeScript configuration (path aliases, strict settings) and
  standardize linting/formatting with ESLint + Prettier. This proposal covers
  the configuration files, minimal scripts in `package.json`, and validation
  steps to ensure the repo adheres to the rules in `TASKS.md` (items 0.4 and
  0.5).

scope:
  - Configure `tsconfig.json` with `@/` path aliases and strict flags.
  - Add ESLint configuration tuned for Expo + React Native + TypeScript.
  - Add Prettier config and ensure ESLint integrates with Prettier rules.
  - Add npm scripts for linting and formatting.
  - Provide validation steps for CI/local developer flow.

motivation: |
  `TASKS.md` requires TypeScript path aliases and strict settings (0.4) and
  ESLint/Prettier setup (0.5). Implementing these will improve DX, code
  consistency, and catch errors earlier.

out-of-scope:
  - Automated CI pipeline changes (adding CI job to run linters). These are
    recommended but handled in a follow-up change.

references:
  - TASKS.md (project tasks 0.4 and 0.5)
  - openspec/project.md (repo conventions)
---

## Requirements Overview

- Provide a `tsconfig.json` that supports `@/` path mapping used across the
  codebase and enables strict TypeScript checks.
- Provide `.eslintrc.js` plus necessary `eslint` dependencies and a
  `.prettierrc` file to enforce consistent code style.
- Add `package.json` scripts: `lint`, `lint:fix`, `format`.
- Include at least one validation scenario per requirement.
