import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Ensure only one graphql instance is loaded across all packages.
    // Without this alias vitest's ESM module graph can end up with two copies
    // (e.g. drizzle-graphql + server code), causing instanceof checks to fail.
    alias: {
      graphql: resolve('./node_modules/graphql/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
  },
});
