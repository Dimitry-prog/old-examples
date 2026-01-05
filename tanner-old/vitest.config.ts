import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        css: true,
        include: ['src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['dist', '.idea', '.git', '.cache'],
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
        // Специальные настройки для PnP
        server: {
          deps: {
            external: ['@tanstack/react-router']
          }
        },
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          exclude: [
            'coverage/**',
            'dist/**',
            '.yarn/**',
            '.pnp.*',
            'start.js',
            '**/*.d.ts',
            '**/*.config.*',
            '**/.*rc.*',
            'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
            '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
            '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
            '**/__tests__/**',
            'vitest.setup.ts',
            'src/types/**',
          ],
        },
      },
    })
  )
);
