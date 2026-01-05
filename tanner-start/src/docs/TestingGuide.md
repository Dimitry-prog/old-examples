# Testing Guide

Руководство по тестированию в проекте с использованием Vitest, React Testing Library и других инструментов.

## Обзор

Стек тестирования:
- **Vitest** - быстрый тест-раннер с поддержкой ES modules
- **React Testing Library** - тестирование React компонентов
- **@testing-library/user-event** - симуляция пользовательских действий
- **@testing-library/jest-dom** - дополнительные матчеры для DOM
- **jsdom** - DOM окружение для тестов

## Структура тестов

```
src/
├── test/
│   ├── setup.ts           # Настройка тестового окружения
│   ├── utils.tsx          # Утилиты для тестирования
│   ├── types.ts           # Типы для тестов
│   ├── factories.ts       # Фабрики тестовых данных
│   └── examples/          # Примеры тестов
│       ├── component.test.tsx
│       ├── hook.test.ts
│       └── utils.test.ts
├── components/
│   └── **/*.test.tsx      # Тесты компонентов
├── hooks/
│   └── **/*.test.ts       # Тесты хуков
└── lib/
    └── **/*.test.ts       # Тесты утилит
```

## Конфигурация

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
})
```

### Setup файл

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  // Глобальные моки
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})
```

## Утилиты для тестирования

### Рендер с провайдерами

```typescript
import { renderWithProviders } from '@/test/utils'

function MyComponentTest() {
  renderWithProviders(<MyComponent />, {
    initialAuth: { user: mockUser, isAuthenticated: true },
    queryClient: createTestQueryClient(),
  })
}
```

### Тестирование хуков

```typescript
import { renderHookWithProviders } from '@/test/utils'

function useMyHookTest() {
  const { result } = renderHookWithProviders(
    () => useMyHook(),
    { queryClient: createTestQueryClient() }
  )
  
  expect(result.current.data).toBeDefined()
}
```

### Фабрики данных

```typescript
import { createTestUser, createTestPost } from '@/test/factories'

const user = createTestUser({ role: 'admin' })
const post = createTestPost({ author: user })
```

## Типы тестов

### 1. Unit тесты

Тестирование отдельных функций и утилит:

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('base-class', 'additional-class')
    expect(result).toBe('base-class additional-class')
  })
})
```

### 2. Component тесты

Тестирование React компонентов:

```typescript
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { LoginForm } from '@/components/auth/LoginForm'

describe('LoginForm', () => {
  it('renders login form correctly', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
  })
})
```

### 3. Hook тесты

Тестирование кастомных хуков:

```typescript
import { describe, it, expect } from 'vitest'
import { renderHookWithProviders } from '@/test/utils'
import { useUsers } from '@/hooks/api/useUsers'

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHookWithProviders(() => useUsers())
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

### 4. Integration тесты

Тестирование взаимодействия компонентов:

```typescript
describe('User Management Flow', () => {
  it('creates and displays new user', async () => {
    renderWithProviders(<UserManagement />)
    
    // Заполняем форму
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New User' }
    })
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /create/i }))
    
    // Проверяем результат
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument()
    })
  })
})
```

## Мокирование

### API запросы

```typescript
import { apiTestUtils } from '@/test/utils'

// Мок успешного ответа
apiTestUtils.mockFetch(
  apiTestUtils.mockSuccessResponse({ users: [mockUser] })
)

// Мок ошибки
apiTestUtils.mockFetch(
  apiTestUtils.mockErrorResponse(500, 'Server Error')
)
```

### localStorage/sessionStorage

```typescript
import { testUtils } from '@/test/setup'

const mockStorage = testUtils.mockLocalStorage({
  'user-token': 'mock-token'
})

expect(mockStorage.getItem).toHaveBeenCalledWith('user-token')
```

### Функции и модули

```typescript
import { vi } from 'vitest'

// Мок функции
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// Мок модуля
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))
```

## Тестирование форм

### Заполнение полей

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

await user.type(screen.getByLabelText(/email/i), 'test@example.com')
await user.click(screen.getByRole('button', { name: /submit/i }))
```

### Валидация

```typescript
it('shows validation errors', async () => {
  renderWithProviders(<MyForm />)
  
  // Отправляем пустую форму
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  
  // Проверяем ошибки
  await waitFor(() => {
    expect(screen.getByText(/email обязателен/i)).toBeInTheDocument()
  })
})
```

## Тестирование состояния

### Zustand store

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/stores/authStore'

it('updates user state', () => {
  const { result } = renderHook(() => useAuthStore())
  
  act(() => {
    result.current.setUser(mockUser)
  })
  
  expect(result.current.user).toEqual(mockUser)
})
```

### TanStack Query

```typescript
it('caches query data', async () => {
  const queryClient = createTestQueryClient()
  
  const { result } = renderHookWithProviders(
    () => useUsers(),
    { queryClient }
  )
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined()
  })
  
  // Проверяем кеш
  const cachedData = queryClient.getQueryData(['users'])
  expect(cachedData).toBeDefined()
})
```

## Тестирование маршрутизации

```typescript
import { createTestRouter } from '@/test/utils'

it('navigates to correct route', () => {
  const router = createTestRouter()
  
  renderWithProviders(<App />, { router })
  
  fireEvent.click(screen.getByRole('link', { name: /dashboard/i }))
  
  expect(router.state.location.pathname).toBe('/dashboard')
})
```

## Асинхронное тестирование

### waitFor

```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
}, { timeout: 3000 })
```

### findBy queries

```typescript
// Автоматически ждет появления элемента
const element = await screen.findByText('Async content')
expect(element).toBeInTheDocument()
```

### act

```typescript
import { act } from '@testing-library/react'

await act(async () => {
  result.current.fetchData()
})
```

## Снапшот тестирование

```typescript
it('matches snapshot', () => {
  const { container } = renderWithProviders(<MyComponent />)
  expect(container.firstChild).toMatchSnapshot()
})
```

## Покрытие кода

```bash
# Запуск тестов с покрытием
npm run test:coverage

# Просмотр отчета
open coverage/index.html
```

### Настройка порогов

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Для конкретных файлов
    'src/lib/utils.ts': {
      branches: 90,
      functions: 90,
    },
  },
}
```

## Команды

```bash
# Запуск всех тестов
npm run test

# Запуск в watch режиме
npm run test:watch

# Запуск с UI
npm run test:ui

# Запуск с покрытием
npm run test:coverage

# Запуск конкретного файла
npm run test -- LoginForm.test.tsx

# Запуск тестов по паттерну
npm run test -- --grep "validation"
```

## Лучшие практики

### 1. Именование тестов

```typescript
// ✅ Хорошо
describe('LoginForm', () => {
  it('shows validation error when email is invalid', () => {})
  it('submits form when all fields are valid', () => {})
})

// ❌ Плохо
describe('LoginForm', () => {
  it('test 1', () => {})
  it('works', () => {})
})
```

### 2. Arrange-Act-Assert

```typescript
it('creates user successfully', async () => {
  // Arrange
  const userData = createTestUser()
  const mockFetch = apiTestUtils.mockSuccessResponse(userData)
  
  // Act
  renderWithProviders(<CreateUserForm />)
  await user.type(screen.getByLabelText(/name/i), userData.name)
  await user.click(screen.getByRole('button', { name: /create/i }))
  
  // Assert
  await waitFor(() => {
    expect(screen.getByText(userData.name)).toBeInTheDocument()
  })
})
```

### 3. Тестирование поведения, а не реализации

```typescript
// ✅ Хорошо - тестируем поведение
it('shows success message after form submission', async () => {
  renderWithProviders(<ContactForm />)
  
  await user.type(screen.getByLabelText(/message/i), 'Hello')
  await user.click(screen.getByRole('button', { name: /send/i }))
  
  expect(await screen.findByText(/message sent/i)).toBeInTheDocument()
})

// ❌ Плохо - тестируем реализацию
it('calls handleSubmit when form is submitted', () => {
  const handleSubmit = vi.fn()
  renderWithProviders(<ContactForm onSubmit={handleSubmit} />)
  
  fireEvent.submit(screen.getByRole('form'))
  
  expect(handleSubmit).toHaveBeenCalled()
})
```

### 4. Использование фабрик данных

```typescript
// ✅ Хорошо
const user = createTestUser({ role: 'admin' })
const post = createTestPost({ author: user })

// ❌ Плохо
const user = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  // ... много полей
}
```

### 5. Очистка после тестов

```typescript
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  queryClient.clear()
})
```

## Отладка тестов

### screen.debug()

```typescript
it('debugs component output', () => {
  renderWithProviders(<MyComponent />)
  
  // Выводит HTML в консоль
  screen.debug()
  
  // Выводит конкретный элемент
  screen.debug(screen.getByRole('button'))
})
```

### logRoles()

```typescript
import { logRoles } from '@testing-library/react'

it('shows available roles', () => {
  const { container } = renderWithProviders(<MyComponent />)
  logRoles(container)
})
```

### Breakpoints

```typescript
it('allows debugging', async () => {
  renderWithProviders(<MyComponent />)
  
  // Пауза для отладки
  await new Promise(resolve => setTimeout(resolve, 10000))
})
```

## Заключение

Тестирование обеспечивает:

- ✅ Уверенность в качестве кода
- ✅ Защиту от регрессий
- ✅ Документирование поведения
- ✅ Упрощение рефакторинга
- ✅ Быструю обратную связь

Следуйте принципам:
- Тестируйте поведение, а не реализацию
- Пишите читаемые и поддерживаемые тесты
- Используйте фабрики для тестовых данных
- Мокируйте внешние зависимости
- Стремитесь к высокому покрытию критического кода