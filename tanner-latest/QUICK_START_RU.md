# 🚀 Быстрый старт - Обработка ошибок RTK Query

## Как это работает?

### 🔴 Middleware ловит автоматически:
- **401** → редирект на `/login` + очистка токена
- **500+** → логирование в консоль
- **Сетевые ошибки** → логирование

### 🟡 В компонентах обрабатываете:
- **403** → "Нет доступа"
- **404** → "Не найдено"
- **422** → "Ошибка валидации"

## Примеры использования

### Query (получение данных)

```tsx
import { useGetUsersQuery } from '@/shared/api/users-api'
import { handleRtkError } from '@/shared/utils/handle-rtk-error'

function Users() {
  const { data, error, isLoading } = useGetUsersQuery()

  if (isLoading) return <div>Загрузка...</div>

  if (error) {
    return handleRtkError(error, {
      403: () => <div>Нет доступа</div>,
      404: () => <div>Не найдено</div>,
      default: () => <div>Ошибка</div>,
    })
  }

  return <div>{data?.map(user => <div key={user.id}>{user.name}</div>)}</div>
}
```

### Mutation (изменение данных)

```tsx
import { useCreateUserMutation } from '@/shared/api/users-api'

function CreateUser() {
  const [createUser, { isLoading }] = useCreateUserMutation()

  const handleSubmit = async (data) => {
    try {
      await createUser(data).unwrap()
      alert('Успех!')
    } catch (error) {
      if (error?.status === 422) {
        alert('Неверные данные')
      }
      // 401 и 500+ обработаны автоматически
    }
  }

  return <button onClick={handleSubmit}>Создать</button>
}
```

## Создание своего API

```typescript
// src/shared/api/posts-api.ts
import { baseApi } from './base-api'

interface Post {
  id: number
  title: string
}

export const postsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => '/posts',
    }),
    createPost: build.mutation<Post, { title: string }>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useGetPostsQuery, useCreatePostMutation } = postsApi
```

## Настройка API URL

Создайте `.env`:
```
VITE_API_URL=https://api.example.com
```

## Добавить toast уведомления

```bash
pnpm add sonner
```

```typescript
// src/shared/middleware/rtk-query-error-logger.ts
import { toast } from 'sonner'

// Раскомментируйте строки с toast
toast.error('Ошибка сервера')
```

## Полезные утилиты

```typescript
import { 
  handleRtkError,      // Обработка ошибок
  getErrorMessage,     // Получить текст ошибки
  isFetchBaseQueryError // Проверка типа
} from '@/shared/utils/handle-rtk-error'
```

## Примеры

Смотрите готовые примеры:
- `src/components/UsersList.example.tsx`
- `src/components/UserProfile.example.tsx`

## Документация

Полная документация: `ERRORS_HANDLING_GUIDE.md`
