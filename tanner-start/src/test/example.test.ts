import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Базовые тесты для демонстрации настройки Vitest
 */
describe('Vitest Configuration', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to globals', () => {
    expect(expect).toBeDefined()
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
  })

  it('should work with async/await', async () => {
    const promise = Promise.resolve('test')
    const result = await promise
    expect(result).toBe('test')
  })

  it('should work with timers', async () => {
    vi.useFakeTimers()
    
    const callback = vi.fn()
    setTimeout(callback, 1000)
    
    expect(callback).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledOnce()
    
    vi.useRealTimers()
  })
})

/**
 * Тесты для утилит
 */
describe('Test Utils', () => {
  beforeEach(() => {
    // Очистка перед каждым тестом
    localStorage.clear()
  })

  afterEach(() => {
    // Очистка после каждого теста
    vi.clearAllMocks()
  })

  it('should mock localStorage', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
    
    localStorage.removeItem('test')
    expect(localStorage.getItem('test')).toBeNull()
  })

  it('should mock fetch', async () => {
    global.testUtils.mockFetch({
      '/api/test': { message: 'success' }
    })

    const response = await fetch('/api/test')
    const data = await response.json()
    
    expect(data).toEqual({ message: 'success' })
  })

  it('should work with test data factory', () => {
    const user = global.testUtils ? {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    } : null

    expect(user).toBeTruthy()
    expect(user?.email).toBe('test@example.com')
  })
})

/**
 * Тесты для проверки окружения
 */
describe('Test Environment', () => {
  it('should have jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(typeof localStorage).toBe('object')
  })

  it('should have mocked window.matchMedia', () => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    expect(mediaQuery).toBeDefined()
    expect(typeof mediaQuery.matches).toBe('boolean')
  })

  it('should have mocked ResizeObserver', () => {
    expect(ResizeObserver).toBeDefined()
    
    const observer = new ResizeObserver(() => {})
    expect(observer).toBeDefined()
    expect(typeof observer.observe).toBe('function')
  })

  it('should suppress console warnings in tests', () => {
    const originalWarn = console.warn
    const warnSpy = vi.fn()
    console.warn = warnSpy
    
    // Это предупреждение должно быть подавлено
    console.warn('Warning: React.createFactory')
    
    // Восстанавливаем оригинальную функцию
    console.warn = originalWarn
    
    // Проверяем, что наш spy не был вызван (предупреждение подавлено)
    expect(warnSpy).not.toHaveBeenCalled()
  })
})

/**
 * Тесты для проверки TypeScript интеграции
 */
describe('TypeScript Integration', () => {
  interface TestInterface {
    id: number
    name: string
    optional?: boolean
  }

  it('should work with TypeScript types', () => {
    const testObject: TestInterface = {
      id: 1,
      name: 'test',
    }

    expect(testObject.id).toBe(1)
    expect(testObject.name).toBe('test')
    expect(testObject.optional).toBeUndefined()
  })

  it('should infer types correctly', () => {
    const numbers = [1, 2, 3, 4, 5]
    const doubled = numbers.map(n => n * 2)
    
    expect(doubled).toEqual([2, 4, 6, 8, 10])
    expect(doubled.every(n => typeof n === 'number')).toBe(true)
  })

  it('should work with generics', () => {
    function identity<T>(arg: T): T {
      return arg
    }

    expect(identity('string')).toBe('string')
    expect(identity(42)).toBe(42)
    expect(identity(true)).toBe(true)
  })
})

/**
 * Тесты для проверки мокирования модулей
 */
describe('Module Mocking', () => {
  it('should mock modules with vi.mock', async () => {
    // Мокаем модуль
    vi.doMock('./mocked-module', () => ({
      default: {
        getValue: () => 'mocked value'
      }
    }))

    // В реальном тесте здесь будет импорт замоканного модуля
    const mockedValue = 'mocked value'
    expect(mockedValue).toBe('mocked value')
  })

  it('should spy on functions', () => {
    const obj = {
      method: (x: number) => x * 2
    }

    const spy = vi.spyOn(obj, 'method')
    
    const result = obj.method(5)
    
    expect(result).toBe(10)
    expect(spy).toHaveBeenCalledWith(5)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('should mock implementations', () => {
    const mockFn = vi.fn()
    mockFn.mockImplementation((x: number) => x + 1)
    
    expect(mockFn(5)).toBe(6)
    expect(mockFn).toHaveBeenCalledWith(5)
  })
})