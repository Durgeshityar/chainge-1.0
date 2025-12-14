## ADDED Requirements

1. ESLint configuration (`.eslintrc.js`) MUST be provided with rules for
   TypeScript and React Native using `@typescript-eslint` and `eslint-plugin-react-native`.
2. Prettier configuration (`.prettierrc`) MUST exist and be compatible with
   ESLint via `eslint-config-prettier`.
3. `package.json` MUST include scripts `lint`, `lint:fix`, and `format`.

#### Scenario: Linting run

Given the repository with `.eslintrc.js` and dependencies installed
When the developer runs `npm run lint`
Then ESLint should analyze `.ts`, `.tsx`, `.js`, `.jsx` files and
report lint errors or warnings according to the configured rules.

#### Scenario: Formatting run

Given the repository with `.prettierrc` present
When the developer runs `npm run format`
Then Prettier should rewrite supported files (`.ts`, `.tsx`, `.js`, `.jsx`,
`.json`, `.md`) to match the repository style.
