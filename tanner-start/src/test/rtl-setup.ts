import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Расширяем expect с матчерами от testing-library
expect.extend(matchers)

// Очистка после каждого теста
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

// Настройка глобальных переменных для React Testing Library
beforeAll(() => {
  // Мокаем window.matchMedia для тестов
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Мокаем ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Мокаем IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }))

  // Мокаем getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: vi.fn().mockImplementation(() => ({
      getPropertyValue: vi.fn().mockReturnValue(''),
      display: 'block',
      visibility: 'visible',
      opacity: '1',
    })),
  })

  // Мокаем scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
  })

  // Мокаем scrollIntoView
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
  })

  // Мокаем getBoundingClientRect
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    value: vi.fn().mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }),
  })

  // Мокаем createRange для тестов с текстовыми полями
  Object.defineProperty(document, 'createRange', {
    value: vi.fn().mockImplementation(() => ({
      setStart: vi.fn(),
      setEnd: vi.fn(),
      commonAncestorContainer: document.createElement('div'),
      selectNode: vi.fn(),
      selectNodeContents: vi.fn(),
      collapse: vi.fn(),
      cloneContents: vi.fn(),
      deleteContents: vi.fn(),
      extractContents: vi.fn(),
      insertNode: vi.fn(),
      surroundContents: vi.fn(),
      cloneRange: vi.fn(),
      toString: vi.fn().mockReturnValue(''),
      detach: vi.fn(),
    })),
  })

  // Мокаем Selection API
  Object.defineProperty(window, 'getSelection', {
    value: vi.fn().mockImplementation(() => ({
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
      toString: vi.fn().mockReturnValue(''),
    })),
  })

  // Мокаем URL.createObjectURL и URL.revokeObjectURL
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: vi.fn().mockReturnValue('mocked-object-url'),
  })

  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
  })

  // Мокаем fetch для тестов
  global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    
    // Базовый мок для API запросов
    if (url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { message: 'Mocked API response' } 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Для остальных запросов возвращаем 404
    return new Response('Not Found', { status: 404 })
  })

  // Мокаем console методы для подавления предупреждений в тестах
  const originalError = console.error
  const originalWarn = console.warn

  console.error = vi.fn().mockImplementation((...args: any[]) => {
    // Игнорируем известные предупреждения React в тестах
    const message = args[0]
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is no longer supported') ||
       message.includes('Warning: An invalid form control') ||
       message.includes('Warning: Failed prop type') ||
       message.includes('Warning: validateDOMNesting'))
    ) {
      return
    }
    originalError.apply(console, args)
  })

  console.warn = vi.fn().mockImplementation((...args: any[]) => {
    // Игнорируем известные предупреждения в тестах
    const message = args[0]
    if (
      typeof message === 'string' &&
      (message.includes('Warning: React.createFactory') ||
       message.includes('Warning: componentWillReceiveProps') ||
       message.includes('Warning: componentWillMount'))
    ) {
      return
    }
    originalWarn.apply(console, args)
  })

  // Мокаем requestAnimationFrame и cancelAnimationFrame
  global.requestAnimationFrame = vi.fn().mockImplementation((cb: FrameRequestCallback) => {
    return setTimeout(() => cb(Date.now()), 16)
  })

  global.cancelAnimationFrame = vi.fn().mockImplementation((id: number) => {
    clearTimeout(id)
  })

  // Мокаем requestIdleCallback
  global.requestIdleCallback = vi.fn().mockImplementation((cb: IdleRequestCallback) => {
    return setTimeout(() => cb({
      didTimeout: false,
      timeRemaining: () => 50,
    }), 1)
  })

  global.cancelIdleCallback = vi.fn().mockImplementation((id: number) => {
    clearTimeout(id)
  })
})

afterAll(() => {
  // Очистка после всех тестов
  vi.restoreAllMocks()
})

// Глобальные утилиты для React Testing Library тестов
declare global {
  var rtlTestUtils: {
    mockComponent: (name: string, implementation?: any) => void
    mockHook: (hookPath: string, implementation: any) => void
    waitForLoadingToFinish: () => Promise<void>
    expectElementToBeVisible: (element: HTMLElement) => void
    expectElementToHaveFocus: (element: HTMLElement) => void
  }
}

global.rtlTestUtils = {
  /**
   * Мокирование React компонента
   */
  mockComponent: (name: string, implementation = () => null) => {
    vi.doMock(name, () => ({
      default: implementation,
      [name]: implementation,
    }))
  },

  /**
   * Мокирование хука
   */
  mockHook: (hookPath: string, implementation: any) => {
    vi.doMock(hookPath, () => implementation)
  },

  /**
   * Ожидание завершения всех загрузок
   */
  waitForLoadingToFinish: async () => {
    // Ждем завершения всех микротасков
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Ждем завершения всех анимаций
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  },

  /**
   * Проверка видимости элемента
   */
  expectElementToBeVisible: (element: HTMLElement) => {
    expect(element).toBeInTheDocument()
    expect(element).toBeVisible()
  },

  /**
   * Проверка фокуса на элементе
   */
  expectElementToHaveFocus: (element: HTMLElement) => {
    expect(element).toHaveFocus()
  },
}

// Кастомные матчеры для React Testing Library
expect.extend({
  toBeVisibleToUser(received: HTMLElement) {
    const pass = received.offsetParent !== null && 
                 !received.hidden && 
                 received.style.display !== 'none' &&
                 received.style.visibility !== 'hidden' &&
                 received.style.opacity !== '0'

    return {
      message: () => 
        pass 
          ? `expected element not to be visible to user`
          : `expected element to be visible to user`,
      pass,
    }
  },

  toHaveLoadingState(received: HTMLElement) {
    const hasLoadingText = received.textContent?.includes('загрузка') || 
                          received.textContent?.includes('loading') ||
                          received.textContent?.includes('...')
    
    const hasLoadingClass = received.classList.contains('loading') ||
                           received.classList.contains('spinner') ||
                           received.querySelector('.loading, .spinner') !== null

    const hasAriaLabel = received.getAttribute('aria-label')?.includes('loading') ||
                        received.getAttribute('aria-busy') === 'true'

    const pass = hasLoadingText || hasLoadingClass || hasAriaLabel

    return {
      message: () =>
        pass
          ? `expected element not to have loading state`
          : `expected element to have loading state`,
      pass,
    }
  },

  toHaveErrorState(received: HTMLElement) {
    const hasErrorText = received.textContent?.includes('ошибка') ||
                        received.textContent?.includes('error')
    
    const hasErrorClass = received.classList.contains('error') ||
                         received.classList.contains('danger') ||
                         received.querySelector('.error, .danger') !== null

    const hasAriaInvalid = received.getAttribute('aria-invalid') === 'true'

    const pass = hasErrorText || hasErrorClass || hasAriaInvalid

    return {
      message: () =>
        pass
          ? `expected element not to have error state`
          : `expected element to have error state`,
      pass,
    }
  },
})

// Типы для кастомных матчеров
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeVisibleToUser(): T
    toHaveLoadingState(): T
    toHaveErrorState(): T
  }
}