/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Окружение для unit тестов
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    
    // Только unit тесты
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.unit.test.{ts,tsx}',
    ],
    
    exclude: [
      'node_modules',
      'dist',
      'src/**/*.integration.test.{ts,tsx}',
      'src/**/*.e2e.test.{ts,tsx}',
      'e2e/**/*',
    ],
    
    // Быстрые настройки для unit тестов
    testTimeout: 5000,
    hookTimeout: 5000,
    
    // Покрытие только для unit тестов
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.{js,ts}',
        'src/**/*.stories.{js,ts,jsx,tsx}',
        'src/test/**',
        'src/mocks/**',
        'src/types/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/routeTree.gen.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Параллельное выполнение для скорости
    threads: true,
    maxThreads: 4,
    
    // Изолировать тесты
    isolate: true,
    
    // Репортеры для unit тестов
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results/unit-results.json',
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})