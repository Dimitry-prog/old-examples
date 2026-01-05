import type { MockedFunction } from 'vitest'
import type { QueryClient } from '@tanstack/react-query'
import type { User } from '@/lib/schemas'

/**
 * Типы для мокированных функций
 */
export type MockedFn<T extends (...args: any[]) => any> = MockedFunction<T>

/**
 * Типы для тестовых данных
 */
export interface TestUser extends User {
  password?: string
}

export interface TestAuthState {
  user: TestUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface TestQueryClientOptions {
  defaultOptions?: {
    queries?: {
      retry?: boolean | number
      gcTime?: number
      staleTime?: number
    }
    mutations?: {
      retry?: boolean | number
    }
  }
}

/**
 * Типы для тестовых провайдеров
 */
export interface TestProvidersConfig {
  queryClient?: QueryClient
  initialAuth?: Partial<TestAuthState>
  routerHistory?: string[]
}

/**
 * Типы для мокированных API ответов
 */
export interface MockApiResponse<T = any> {
  data?: T
  error?: string
  status?: number
  statusText?: string
}

export interface MockApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, any>
}

/**
 * Типы для тестирования форм
 */
export interface FormTestData {
  [key: string]: string | number | boolean | string[]
}

export interface FormValidationError {
  field: string
  message: string
}

/**
 * Типы для тестирования компонентов
 */
export interface ComponentTestProps {
  [key: string]: any
}

export interface ComponentTestContext {
  user?: TestUser
  isAuthenticated?: boolean
  queryClient?: QueryClient
}

/**
 * Типы для тестирования хуков
 */
export interface HookTestResult<T> {
  result: {
    current: T
  }
  rerender: (newProps?: any) => void
  unmount: () => void
}

/**
 * Типы для тестирования API хуков
 */
export interface ApiHookTestConfig {
  mockData?: any
  mockError?: MockApiError
  initialEnabled?: boolean
}

/**
 * Типы для тестирования мутаций
 */
export interface MutationTestConfig<TData, TVariables> {
  mockData?: TData
  mockError?: MockApiError
  variables?: TVariables
}

/**
 * Типы для тестирования запросов
 */
export interface QueryTestConfig<TData> {
  mockData?: TData
  mockError?: MockApiError
  queryKey?: any[]
  enabled?: boolean
}

/**
 * Типы для тестирования роутинга
 */
export interface RouterTestConfig {
  initialPath?: string
  routes?: string[]
  params?: Record<string, string>
  search?: Record<string, any>
}

/**
 * Типы для тестирования состояния
 */
export interface StateTestConfig<T> {
  initialState?: T
  expectedState?: T
  stateSelector?: (state: any) => T
}

/**
 * Типы для тестовых утилит
 */
export interface TestUtilsConfig {
  timeout?: number
  retries?: number
  interval?: number
}

/**
 * Типы для мокирования localStorage/sessionStorage
 */
export interface StorageMock {
  getItem: MockedFn<(key: string) => string | null>
  setItem: MockedFn<(key: string, value: string) => void>
  removeItem: MockedFn<(key: string) => void>
  clear: MockedFn<() => void>
  length: number
  key: MockedFn<(index: number) => string | null>
}

/**
 * Типы для мокирования fetch
 */
export interface FetchMock {
  mockResolvedValue: (value: any) => void
  mockRejectedValue: (error: any) => void
  mockImplementation: (fn: (...args: any[]) => any) => void
  mockRestore: () => void
}

/**
 * Типы для тестирования событий
 */
export interface EventTestConfig {
  type: string
  target?: EventTarget
  bubbles?: boolean
  cancelable?: boolean
  detail?: any
}

/**
 * Типы для тестирования анимаций
 */
export interface AnimationTestConfig {
  duration?: number
  easing?: string
  delay?: number
}

/**
 * Типы для тестирования производительности
 */
export interface PerformanceTestConfig {
  maxRenderTime?: number
  maxMemoryUsage?: number
  iterations?: number
}

/**
 * Типы для снапшот тестирования
 */
export interface SnapshotTestConfig {
  name?: string
  properties?: string[]
  exclude?: string[]
}

/**
 * Типы для интеграционных тестов
 */
export interface IntegrationTestConfig {
  apiBaseUrl?: string
  testDatabase?: string
  fixtures?: Record<string, any>
}

/**
 * Типы для E2E тестирования
 */
export interface E2ETestConfig {
  baseUrl?: string
  viewport?: {
    width: number
    height: number
  }
  timeout?: number
  retries?: number
}

/**
 * Утилитарные типы
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type MockedObject<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? MockedFn<T[K]> : T[K]
}

export type TestFactory<T> = (overrides?: DeepPartial<T>) => T

/**
 * Константы для тестирования
 */
export const TEST_TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 5000,
  LONG: 10000,
  VERY_LONG: 30000,
} as const

export const TEST_DELAYS = {
  IMMEDIATE: 0,
  SHORT: 100,
  MEDIUM: 500,
  LONG: 1000,
} as const

export const TEST_RETRY_COUNTS = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
} as const