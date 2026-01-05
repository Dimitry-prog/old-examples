/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Окружение для integration тестов
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    
    // Только integration тесты
    include: [
      'src/**/*.integration.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],
    
    exclude: [
      'node_modules',
      'dist',
      'src/**/*.test.{ts,tsx}',
      'src/**/*.unit.test.{ts,tsx}',
      'src/**/*.e2e.test.{ts,tsx}',
      'e2e/**/*',
    ],
    
    // Более длительные таймауты для integration тестов
    testTimeout: 15000,
    hookTimeout: 15000,
    
    // Последовательное выполнение для стабильности
    threads: false,
    
    // Изолировать тесты
    isolate: true,
    
    // Репортеры для integration тестов
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results/integration-results.json',
    },
    
    // Покрытие для integration тестов
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      reportsDirectory: './coverage/integration',
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
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})