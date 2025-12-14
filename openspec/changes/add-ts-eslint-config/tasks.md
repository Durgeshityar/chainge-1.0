---


change-id: add-ts-eslint-config
title: Implementation tasks for TypeScript + ESLint/Prettier

- [x] Create or update `tsconfig.json` with the following minimum:
   - `baseUrl: "."` and `paths` mapping `@/*` → `./*`.
   - `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`.
   - `jsx: react-jsx` (or appropriate for Expo setup) and `resolveJsonModule`.
   - Validation: run `tsc -p tsconfig.json --noEmit`.

- [x] Add `.eslintrc.js` with recommended presets:
   - `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-native`,
      `eslint-config-prettier`, `eslint-plugin-import`.
   - Integrate Prettier via `eslint-config-prettier`.
   - Provide `lint` and `lint:fix` scripts.

- [x] Add `.prettierrc` and `.prettierignore` with repository defaults.

- [x] Update `package.json` scripts:
   - `lint`: `eslint "**/*.{ts,tsx,js,jsx}"`
   - `lint:fix`: `eslint --fix "**/*.{ts,tsx,js,jsx}"`
   - `format`: `prettier --write "**/*.{ts,tsx,js,jsx,json,md}"`

- [x] Document developer flow in this change's `design.md` (how to add new path aliases,
   how to run fixers, how to opt out for generated files).

- [x] Validation step: add local validation instructions—`tsc --noEmit`, `npm run lint`.

- [ ] Optional (follow-up): add CI job to run `tsc` and `eslint` on PRs.
