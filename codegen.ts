import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: [
    'packages/client/src/**/*.{tsx,ts}',
    '!packages/client/src/__generated__/**',
  ],
  generates: {
    'packages/client/src/__generated__/': {
      preset: 'client',
      config: { documentMode: 'string' },
    },
  },
};

export default config;
