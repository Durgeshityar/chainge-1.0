module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  env: {
    es2021: true,
    'react-native/react-native': true
  },
  plugins: ['@typescript-eslint', 'react', 'react-native', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': { typescript: {} }
  },
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react-native/no-inline-styles': 'warn',
    'import/no-unresolved': 'error'
  }
};
