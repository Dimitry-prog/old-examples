# Руководство по обработке ошибок RTK Query

## 🎯 Что реализовано

Двухуровневая система обработки ошибок:

### Уровень 1: Middleware (глобальный)
- ✅ **401** - автоматический редирект на `/login` + очистка токена
- ✅ **500+** - логирование серверных ошибок
- ✅ **FETCH_ERROR/PARSING_ERROR** - обработка сетевых ошибок

### Уровень 2: Компоненты (локальный)
- ✅ **403** - нет доступа
- ✅ **404** - не найдено
- ✅ **422** - ошибки валидации
- ✅ Другие 4xx статусы

## 📁 Структура файлов

```
src/
├── shared/
│   ├── api/
│   │   ├── base-api.ts              # Базовая конфигурация RTK Query
│   │   ├── users-api.ts             # Пример API эндпоинтов
│   │   └── README.md                # Документация API
│   ├── store/
│   │   ├── index.ts                 # Конфигурация Redux store
│   │   └── hooks.ts                 # Типизированные хуки
│   ├── middleware/
│   │   └── rtk-query-error-logger.ts # Middleware для обработки ошибок
│   └── utils/
│       └── handle-rtk-error.tsx     # Утилиты для работы с ошибками
├── components/
│   ├── UsersList.example.tsx        # Пример: список + мутации
│   └── UserProfile.example.tsx      # Пример: детальная страница
└── main.tsx                         # Redux Provider подключен
```

## 🚀 Быстрый старт

### 1. Создайте свой API

```typescript
// src/shared/api/posts-api.ts
import { baseApi } from './base-api'

export const postsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => '/posts',
    }),
  }),
})

export const { useGetPostsQuery } = postsApi
```

### 2. Используйте в компоненте

```typescript
import { useGetPostsQuery } from '@/shared/api/posts-api'
import { handleRtkError } from '@/shared/utils/handle-rtk-error'

function PostsList() {
  const { data, error, isLoading } = useGetPostsQuery()

  if (isLoading) return <div>Загрузка...</div>

  if (error) {
    return handleRtkError(error, {
      403: () => <div>Нет доступа к постам</div>,
      404: () => <div>Посты не найдены</div>,
      default: () => <div>Ошибка загрузки</div>,
    })
  }

  return <div>{/* Отображение постов */}</div>
}
```

### 3. Обработка мутаций

```typescript
function CreatePost() {
  const [createPost] = useCreatePostMutation()

  const handleSubmit = async (data) => {
    try {
      await createPost(data).unwrap()
      // Успех
    } catch (error) {
      if (error && 'status' in error) {
        if (error.status === 422) {
          // Обработка ошибок валидации
        }
      }
    }
  }

  return <form onSubmit={handleSubmit}>{/* форма */}</form>
}
```

## 🔧 Настройка

### Изменить базовый URL API

```typescript
// src/shared/api/base-api.ts
baseUrl: process.env.VITE_API_URL || '/api'
```

Добавьте в `.env`:
```
VITE_API_URL=https://api.example.com
```

### Добавить toast уведомления

1. Установите библиотеку:
```bash
pnpm add sonner
```

2. Раскомментируйте в `rtk-query-error-logger.ts`:
```typescript
import { toast } from 'sonner'

// В middleware:
toast.error('Произошла ошибка сервера')
```

### Изменить логику 401

```typescript
// src/shared/middleware/rtk-query-error-logger.ts
if (status === 401) {
  localStorage.removeItem('authToken')
  // Ваша логика редиректа
  window.location.href = '/login'
}
```

## 📚 Примеры

Смотрите готовые примеры:
- `src/components/UsersList.example.tsx`
- `src/components/UserProfile.example.tsx`

## 🛠 Утилиты

### handleRtkError
Декларативная обработка ошибок:
```typescript
handleRtkError(error, {
  403: () => <AccessDenied />,
  404: () => <NotFound />,
  default: () => <Error />,
})
```

### getErrorMessage
Извлечение сообщения:
```typescript
const message = getErrorMessage(error)
```

### Type Guards
```typescript
if (isFetchBaseQueryError(error)) {
  console.log(error.status)
}
```

## ✅ Что дальше?

1. Создайте свои API эндпоинты в `src/shared/api/`
2. Используйте хуки в компонентах
3. Добавьте toast библиотеку для уведомлений
4. Настройте переменные окружения

## 📖 Дополнительная документация

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Error Handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling)
- Подробная документация: `src/shared/api/README.md`
