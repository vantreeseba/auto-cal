import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CodegenConfig } from '@graphql-codegen/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: CodegenConfig = {
  schema: path.resolve(
    __dirname,
    'packages/server/src/__generated__/schema.graphql',
  ),
  documents: [
    path.resolve(__dirname, 'packages/client/src/**/*.{tsx,ts}'),
    // Exclude generated output and auth routes that use raw gql (not typed codegen)
    `!${path.resolve(__dirname, 'packages/client/src/__generated__/**')}`,
    `!${path.resolve(__dirname, 'packages/client/src/routes/login.tsx')}`,
    `!${path.resolve(__dirname, 'packages/client/src/routes/auth.verify.tsx')}`,
  ],
  ignoreNoDocuments: true,
  generates: {
    [`${path.resolve(__dirname, 'packages/client/src/__generated__')}/`]: {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
//       config: { documentMode: 'string' },
    },
  },
};

export default config;
