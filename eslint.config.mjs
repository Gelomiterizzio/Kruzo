import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/**
 * ESLint 9 flat config.
 * Replaces the legacy .eslintrc.json (incompatible with ESLint 9 +
 * eslint-config-next 16, which ships as a flat config array).
 *
 * Rule overrides are scoped to TS/TSX because eslint-config-next only
 * registers the `@typescript-eslint` plugin namespace for those files.
 */
const config = [
  ...nextCoreWebVitals,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'warn',
      // Downgraded to warnings (Phase 0): these new React-Compiler-aware rules
      // flag the existing "fetch-on-mount" data hooks and inline components.
      // The hooks are scheduled to be replaced by React Query in Phase 2, which
      // removes these effects entirely. Tracked, not silenced.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'functions/**',
      'turbopack-leaflet-empty.js',
    ],
  },
]

export default config
