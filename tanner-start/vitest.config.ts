/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Настройки для тестирования
  test: {
    // Окружение для тестов (jsdom для React компонентов)
    environment: 'jsdom',
    
    // Глобальные переменные (describe, it, expect)
    globals: true,
    
    // Setup файлы, которые выполняются перед каждым тестом
    setupFiles: ['./src/test/setup.ts'],
    
    // Паттерны для поиска тестовых файлов
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Исключаемые файлы и папки
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'build',
      'coverage',
    ],
    
    // Настройки покрытия кода
    coverage: {
      // Провайдер покрытия (v8 быстрее, c8 более точный)
      provider: 'v8',
      
      // Форматы отчетов
      reporter: ['text', 'json', 'html', 'lcov'],
      
      // Директория для отчетов
      reportsDirectory: './coverage',
      
      // Включаемые файлы для анализа покрытия
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
      ],
      
      // Исключаемые файлы
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
      
      // Пороги покрытия
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
      
      // Не падать при недостаточном покрытии (для CI можно включить)
      skipFull: false,
    },
    
    // Настройки для watch режима
    watch: {
      // Игнорировать изменения в этих папках
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
    },
    
    // Таймаут для тестов (в миллисекундах)
    testTimeout: 10000,
    
    // Таймаут для хуков (beforeAll, afterAll, etc.)
    hookTimeout: 10000,
    
    // Количество попыток для нестабильных тестов
    retry: 0,
    
    // Параллельное выполнение тестов
    threads: true,
    
    // Максимальное количество потоков
    maxThreads: 4,
    
    // Минимальное количество потоков
    minThreads: 1,
    
    // Изолировать каждый тестовый файл в отдельном контексте
    isolate: true,
    
    // Настройки для UI
    ui: {
      enabled: true,
      open: false, // Не открывать браузер автоматически
      port: 51204,
    },
    
    // Настройки для репортеров
    reporters: [
      'default', // Стандартный консольный репортер
      'json',    // JSON отчет для CI
      'html',    // HTML отчет
    ],
    
    // Директория для выходных файлов
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },
    
    // Настройки для мокирования
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Настройки для снапшотов
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace(/\.test\.([tj]sx?)/, `.__snapshots__$1.snap`)
    },
  },
  
  // Алиасы путей (должны совпадать с tsconfig.json)
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/contexts': resolve(__dirname, './src/contexts'),
      '@/providers': resolve(__dirname, './src/providers'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/routes': resolve(__dirname, './src/routes'),
      '@/styles': resolve(__dirname, './src/styles'),
      '@/assets': resolve(__dirname, './src/assets'),
      '@/test': resolve(__dirname, './src/test'),
    },
  },
  
  // Определение переменных окружения для тестов
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3001/api'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Modern React Stack'),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
  },
})