# TanStack Query Integration Guide

Руководство по настройке и использованию TanStack Query для управления серверным состоянием.

## Обзор

TanStack Query обеспечивает:
- Кеширование данных с автоматической инвалидацией
- Фоновое обновление данных
- Оптимистичные обновления
- Повторные запросы при ошибках
- Бесконечная прокрутка
- Оффлайн поддержка

## Основные файлы

### 1. Конфигурация QueryClient (`src/lib/queryClient.ts`)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      gcTime: 1000 * 60 * 10,   // 10 минут
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
})

// Централизованные ключи запросов
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.all, 'list', { filters }] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
}
```

### 2. Провайдер (`src/providers/QueryProvider.tsx`)

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
```

### 3. API хуки (`src/hooks/api/`)

Структура хуков для работы с API:
- `useUsers.ts` - управление пользователями
- `usePosts.ts` - работа с постами
- `useComments.ts` - комментарии

## Использование

### Базовые запросы

```typescript
import { useUsers, useUser } from '@/hooks/api/useUsers'

function UsersList() {
  const { data, isLoading, error } = useUsers({
    page: 1,
    limit: 10,
    search: 'john',
  })

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error.message}</div>

  return (
    <div>
      {data?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Мутации

```typescript
import { useCreateUser, useUpdateUser } from '@/hooks/api/useUsers'

function UserForm() {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const handleCreate = async (userData) => {
    try {
      await createUser.mutateAsync(userData)
      // Успех
    } catch (error) {
      // Ошибка
    }
  }

  return (
    <form onSubmit={handleCreate}>
      {/* Форма */}
      <button 
        type="submit" 
        disabled={createUser.isPending}
      >
        {createUser.isPending ? 'Создание...' : 'Создать'}
      </button>
    </form>
  )
}
```

### Бесконечная прокрутка

```typescript
import { useInfinitePosts } from '@/hooks/api/usePosts'

function PostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts({ limit: 10 })

  const allPosts = data?.pages.flatMap(page => page.posts) ?? []

  return (
    <div>
      {allPosts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
        </button>
      )}
    </div>
  )
}
```

### Оптимистичные обновления

```typescript
import { useLikePost } from '@/hooks/api/usePosts'

const likePost = useLikePost()

const handleLike = async (postId: string, liked: boolean) => {
  try {
    await likePost.mutateAsync({ id: postId, liked })
  } catch (error) {
    // Откат произойдет автоматически
  }
}
```

## Управление кешем

### Инвалидация данных

```typescript
import { queryUtils } from '@/lib/queryClient'

// Инвалидация всех пользователей
queryUtils.invalidateUsers()

// Инвалидация конкретного пользователя
queryUtils.invalidateUser('user-id')

// Инвалидация профиля
queryUtils.invalidateProfile()
```

### Предварительная загрузка

```typescript
import { usePrefetchUser } from '@/hooks/api/useUsers'

function UserCard({ userId }: { userId: string }) {
  const prefetchUser = usePrefetchUser()

  return (
    <div 
      onMouseEnter={() => prefetchUser(userId)}
    >
      Наведите для предзагрузки
    </div>
  )
}
```

### Работа с кешем

```typescript
import { queryUtils } from '@/lib/queryClient'

// Установка данных в кеш
queryUtils.setUserData('user-id', userData)

// Получение данных из кеша
const cachedUser = queryUtils.getUserData('user-id')

// Удаление из кеша
queryUtils.removeUserData('user-id')

// Очистка всего кеша
queryUtils.clearCache()
```

## Продвинутые возможности

### Персистентный кеш

```typescript
import { usePersistentCache } from '@/hooks/useCacheManager'

function App() {
  const { saveToStorage, loadFromStorage } = usePersistentCache()

  useEffect(() => {
    // Загрузка кеша при старте
    loadFromStorage()
  }, [])

  // Кеш автоматически сохраняется при изменениях
}
```

### Оффлайн поддержка

```typescript
import { useOfflineManager } from '@/hooks/useCacheManager'

function OfflineIndicator() {
  const { isOnline, offlineQueriesCount, retryOfflineQueries } = useOfflineManager()

  if (!isOnline) {
    return (
      <div>
        Нет соединения. Неудачных запросов: {offlineQueriesCount}
        <button onClick={retryOfflineQueries}>
          Повторить
        </button>
      </div>
    )
  }

  return null
}
```

### Статистика кеша

```typescript
import { useCacheManager } from '@/hooks/useCacheManager'

function CacheStats() {
  const { queriesCount, cacheSizeFormatted, clearAll } = useCacheManager()

  return (
    <div>
      <p>Запросов в кеше: {queriesCount}</p>
      <p>Размер кеша: {cacheSizeFormatted}</p>
      <button onClick={clearAll}>Очистить кеш</button>
    </div>
  )
}
```

## Интеграция с формами

```typescript
import { useZodForm } from '@/hooks/useZodForm'
import { useCreateUser } from '@/hooks/api/useUsers'

function CreateUserForm() {
  const form = useZodForm(createUserSchema)
  const createUser = useCreateUser()

  const onSubmit = async (data) => {
    try {
      await createUser.mutateAsync(data)
      form.reset()
    } catch (error) {
      // Обработка ошибок
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Поля формы */}
    </form>
  )
}
```

## DevTools

TanStack Query DevTools автоматически включаются в режиме разработки:

- Просмотр всех запросов и их состояний
- Инспекция кеша
- Ручная инвалидация
- Мониторинг производительности

## Лучшие практики

### 1. Структура ключей запросов

```typescript
// Иерархическая структура
const queryKeys = {
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
}
```

### 2. Обработка ошибок

```typescript
const { data, error, isError } = useUsers()

if (isError) {
  // Логирование ошибки
  console.error('Users fetch error:', error)
  
  // Показ пользователю
  return <ErrorMessage error={error} />
}
```

### 3. Оптимизация производительности

```typescript
// Используйте select для трансформации данных
const { data: userNames } = useUsers({}, {
  select: (data) => data.users.map(user => user.name),
})

// Отключайте запросы когда не нужно
const { data } = useUser(userId, { enabled: !!userId })
```

### 4. Типизация

```typescript
// Всегда типизируйте ответы API
const usersSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
})

type UsersResponse = z.infer<typeof usersSchema>
```

## Заключение

TanStack Query обеспечивает:

- ✅ Автоматическое кеширование и инвалидацию
- ✅ Оптимистичные обновления
- ✅ Фоновое обновление данных
- ✅ Повторные запросы при ошибках
- ✅ Бесконечную прокрутку
- ✅ Оффлайн поддержку
- ✅ DevTools для отладки
- ✅ TypeScript интеграцию

Все настройки оптимизированы для production использования.