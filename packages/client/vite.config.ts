import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { GraphQLCodegen } from 'vite-plugin-graphql-codegen';

export default defineConfig({
  plugins: [
    react(),
    GraphQLCodegen({
      configFilePathOverride: '../../codegen.ts',
      // Codegen requires a running server; disable during production builds
      runOnBuild: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
