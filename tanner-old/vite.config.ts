import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  const targetHost = process.env.VITE_TARGET_HOST;

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        generatedRouteTree: './src/shared/lib/router/routeTree.gen.ts',
        routesDirectory: './src/routes',
      }),
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared/'),
        '@pages': path.resolve(__dirname, './src/pages/'),
      },
    },
    server: {
      port: 5001,
      open: true,
      proxy: {
        '/api': {
          target: targetHost,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
