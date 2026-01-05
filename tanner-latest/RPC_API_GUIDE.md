# 🚀 RTK Query с единым POST endpoint (RPC-style)

## Что это?

Если ваш бэкенд использует единый POST endpoint для всех операций (RPC-style API), RTK Query легко с этим работает через custom `baseQuery`.

## 📦 Структура запроса

Все запросы отправляются на один URL методом POST:

```
POST /api/rpc
Content-Type: application/json

{
  "method": "users.list",
  "params": {
    "limit": 10,
    "offset": 0
  }
}
```

## 📥 Структура ответа

### Успешный ответ:
```json
{
  "result": {
    "users": [...]
  }
}
```

### Ответ с ошибкой:
```json
{
  "error": {
    "code": 403,
    "message": "Access denied",
    "data": { ... }
  }
}
```

## 🔧 Реализация

### 1. Custom baseQuery

Файл: `src/shared/api/rpc-base-query.ts`

```typescript
import type { BaseQueryFn } from '@reduxjs/toolkit/query'

interface RPCRequest {
  method: string
  params?: unknown
}

export const createRPCBaseQuery = (
  baseUrl: string,
  endpoint = '/'
): BaseQueryFn<RPCRequest | string, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    const rpcRequest: RPCRequest = typeof args === 'string' 
      ? { method: args }
      : args

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(rpcRequest),
    })

    const data = await response.json()

    if (data.error) {
      return {
        error: {
          status: data.error.code,
          data: data.error.data || data.error.message,
        },
      }
    }

    return { data: data.result }
  }
}
```

### 2. Создание API

Файл: `src/shared/api/my-rpc-api.ts`

```typescript
import { createApi } from '@reduxjs/toolkit/query/react'
import { createRPCBaseQuery } from './rpc-base-query'

export const myApi = createApi({
  reducerPath: 'myApi',
  baseQuery: createRPCBaseQuery('/api', '/rpc'),
  endpoints: (build) => ({
    // Query - получение данных
    getUsers: build.query<User[], void>({
      query: () => ({
        method: 'users.list',
        params: {},
      }),
    }),

    // Query с параметрами
    getUserById: build.query<User, number>({
      query: (id) => ({
        method: 'users.get',
        params: { id },
      }),
    }),

    // Mutation - изменение данных
    createUser: build.mutation<User, CreateUserData>({
      query: (userData) => ({
        method: 'users.create',
        params: userData,
      }),
    }),

    // Сложный запрос с множественными параметрами
    searchUsers: build.query<User[], SearchParams>({
      query: ({ query, limit = 10, offset = 0 }) => ({
        method: 'users.search',
        params: { query, limit, offset },
      }),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useSearchUsersQuery,
} = myApi
```

### 3. Подключение к store

Файл: `src/shared/store/index.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { myApi } from '../api/my-rpc-api'
import { rtkQueryErrorLogger } from '../middleware/rtk-query-error-logger'

export const store = configureStore({
  reducer: {
    [myApi.reducerPath]: myApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(myApi.middleware)
      .concat(rtkQueryErrorLogger),
})
```

## 💡 Использование в компонентах

### Query (получение данных)

```typescript
function UsersList() {
  const { data, error, isLoading } = useGetUsersQuery()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error.message}</div>

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Query с параметрами

```typescript
function UserProfile({ userId }: { userId: number }) {
  const { data: user } = useGetUserByIdQuery(userId)

  return <div>{user?.name}</div>
}
```

### Mutation (изменение данных)

```typescript
function CreateUser() {
  const [createUser, { isLoading }] = useCreateUserMutation()

  const handleSubmit = async (data: CreateUserData) => {
    try {
      await createUser(data).unwrap()
      alert('Пользователь создан!')
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }

  return <button onClick={handleSubmit}>Создать</button>
}
```

### Сложные запросы

```typescript
function SearchUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: users } = useSearchUsersQuery({
    query: searchQuery,
    limit: 20,
    offset: 0,
  }, {
    skip: !searchQuery, // Не выполнять запрос, если нет query
  })

  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {users?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  )
}
```

## 🎯 Примеры методов

### Стандартные CRUD операции:

```typescript
// Список
{ method: 'users.list', params: {} }

// Получение по ID
{ method: 'users.get', params: { id: 123 } }

// Создание
{ method: 'users.create', params: { name: 'John', email: 'john@example.com' } }

// Обновление
{ method: 'users.update', params: { id: 123, name: 'John Doe' } }

// Удаление
{ method: 'users.delete', params: { id: 123 } }
```

### Сложные операции:

```typescript
// Поиск с фильтрами
{
  method: 'users.search',
  params: {
    query: 'john',
    filters: { role: 'admin' },
    limit: 10,
    offset: 0
  }
}

// Пакетная операция
{
  method: 'users.batchUpdate',
  params: {
    ids: [1, 2, 3],
    data: { status: 'active' }
  }
}

// Агрегация
{
  method: 'analytics.getUserStats',
  params: {
    userId: 123,
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31'
  }
}
```

## ✅ Преимущества

1. **Единая точка входа** - все запросы идут на один URL
2. **Гибкость** - легко добавлять новые методы
3. **Типизация** - полная поддержка TypeScript
4. **Кеширование** - RTK Query автоматически кеширует результаты
5. **Обработка ошибок** - работает с существующим middleware

## 🔄 Обработка ошибок

Обработка ошибок работает так же, как и с обычным REST API:

```typescript
function MyComponent() {
  const { data, error } = useGetUsersQuery()

  if (error && 'status' in error) {
    if (error.status === 403) {
      return <div>Нет доступа</div>
    }
    if (error.status === 404) {
      return <div>Метод не найден</div>
    }
  }

  return <div>{/* контент */}</div>
}
```

Глобальная обработка (401, 500+) работает через middleware автоматически!

## 📚 Дополнительные возможности

### Кеширование и инвалидация

```typescript
endpoints: (build) => ({
  getUsers: build.query<User[], void>({
    query: () => ({ method: 'users.list', params: {} }),
    providesTags: ['User'],
  }),
  
  createUser: build.mutation<User, CreateUserData>({
    query: (data) => ({ method: 'users.create', params: data }),
    invalidatesTags: ['User'], // Обновит список после создания
  }),
})
```

### Polling (автообновление)

```typescript
const { data } = useGetUsersQuery(undefined, {
  pollingInterval: 5000, // Обновлять каждые 5 секунд
})
```

### Условное выполнение

```typescript
const { data } = useGetUserByIdQuery(userId, {
  skip: !userId, // Не выполнять, если нет userId
})
```

## 🎨 Пример полного API

Смотрите готовый пример:
- `src/shared/api/rpc-base-query.ts` - custom baseQuery
- `src/shared/api/rpc-api.example.ts` - пример API
- `src/components/RPCExample.tsx` - пример компонента

## 🔗 Полезные ссылки

- [RTK Query Custom Queries](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries)
- [BaseQuery API](https://redux-toolkit.js.org/rtk-query/api/createApi#basequery)
