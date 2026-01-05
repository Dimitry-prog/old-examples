# 🚀 Быстрый старт - RPC API с единым POST endpoint

## Что это?

Ваш бэкенд использует **один POST endpoint** для всех операций? RTK Query легко с этим работает!

```
POST /api/rpc
{
  "method": "users.list",
  "params": { ... }
}
```

## 📦 Что создано

1. **src/shared/api/rpc-base-query.ts** - custom baseQuery для RPC
2. **src/shared/api/rpc-api.example.ts** - пример API с методами
3. **src/components/RPCExample.tsx** - пример компонента
4. **src/shared/store/index.ts** - обновлен (добавлен rpcApi)

## 🎯 Как использовать

### 1. Создайте свой RPC API

```typescript
// src/shared/api/my-rpc-api.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { createRPCBaseQuery } from './rpc-base-query'

export const myApi = createApi({
  reducerPath: 'myApi',
  baseQuery: createRPCBaseQuery('/api', '/rpc'),
  endpoints: (build) => ({
    // Получение данных
    getUsers: build.query<User[], void>({
      query: () => ({
        method: 'users.list',  // ← название метода
        params: {},            // ← параметры
      }),
    }),

    // Создание данных
    createUser: build.mutation<User, CreateUserData>({
      query: (data) => ({
        method: 'users.create',
        params: data,
      }),
    }),
  }),
})

export const { useGetUsersQuery, useCreateUserMutation } = myApi
```

### 2. Добавьте в store

```typescript
// src/shared/store/index.ts
import { myApi } from '../api/my-rpc-api'

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

### 3. Используйте в компонентах

```typescript
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()
  const [createUser] = useCreateUserMutation()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка</div>

  return (
    <div>
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => createUser({ name: 'John' })}>
        Создать
      </button>
    </div>
  )
}
```

## 📝 Примеры методов

### Простые запросы

```typescript
// Список всех пользователей
{ method: 'users.list', params: {} }

// Получить пользователя по ID
{ method: 'users.get', params: { id: 123 } }

// Создать пользователя
{ method: 'users.create', params: { name: 'John', email: 'john@example.com' } }
```

### С параметрами

```typescript
// Поиск
{
  method: 'users.search',
  params: {
    query: 'john',
    limit: 10,
    offset: 0
  }
}

// Фильтрация
{
  method: 'products.list',
  params: {
    category: 'electronics',
    minPrice: 100,
    maxPrice: 1000
  }
}
```

### Сложные операции

```typescript
// Пакетное обновление
{
  method: 'users.batchUpdate',
  params: {
    ids: [1, 2, 3],
    data: { status: 'active' }
  }
}

// Агрегация
{
  method: 'analytics.getStats',
  params: {
    userId: 123,
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31'
  }
}
```

## 🎨 Структура запроса/ответа

### Запрос на сервер:
```json
POST /api/rpc
Content-Type: application/json

{
  "method": "users.list",
  "params": {
    "limit": 10
  }
}
```

### Успешный ответ:
```json
{
  "result": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ]
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

## ✨ Особенности

✅ **Единый endpoint** - все запросы на один URL  
✅ **Типизация** - полная поддержка TypeScript  
✅ **Кеширование** - автоматическое кеширование RTK Query  
✅ **Обработка ошибок** - работает с существующим middleware  
✅ **Авторизация** - автоматически добавляет токен  

## 🔧 Настройка

### Изменить endpoint:

```typescript
createRPCBaseQuery('/api', '/rpc')  // ← ваш endpoint
```

### Изменить формат запроса:

Отредактируйте `src/shared/api/rpc-base-query.ts`:

```typescript
body: JSON.stringify({
  method: rpcRequest.method,
  params: rpcRequest.params,
  // Добавьте свои поля:
  jsonrpc: '2.0',
  id: Date.now(),
})
```

## 📚 Полная документация

Смотрите: **RPC_API_GUIDE.md**

## 🎯 Примеры

- `src/shared/api/rpc-api.example.ts` - готовые примеры методов
- `src/components/RPCExample.tsx` - пример использования в компоненте

## 💡 Совет

Обработка ошибок работает так же, как и с REST API:
- **401** → автоматический редирект (middleware)
- **500+** → логирование (middleware)
- **403, 404, 422** → обработка в компонентах

```typescript
if (error && 'status' in error) {
  if (error.status === 403) {
    return <div>Нет доступа</div>
  }
}
```
