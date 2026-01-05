# 🎯 Полное руководство - RTK Query с обработкой ошибок и RPC API

## 📚 Что реализовано

### 1. Обработка ошибок (двухуровневая система)

✅ **Middleware (глобальный уровень)**
- 401 → автоматический редирект на `/login` + очистка токена
- 500+ → логирование серверных ошибок
- FETCH_ERROR → логирование сетевых ошибок

✅ **Компоненты (локальный уровень)**
- 403 → нет доступа
- 404 → не найдено
- 422 → ошибки валидации

### 2. RPC API (единый POST endpoint)

✅ **Custom baseQuery для RPC-style API**
- Все запросы на один endpoint методом POST
- Автоматическое добавление токена
- Парсинг ответов в формате RPC

✅ **Готовые примеры**
- CRUD операции
- Сложные запросы с фильтрами
- Полная типизация TypeScript

## 📁 Структура проекта

```
src/
├── shared/
│   ├── api/
│   │   ├── base-api.ts              # REST API (стандартный)
│   │   ├── users-api.ts             # Пример REST endpoints
│   │   ├── rpc-base-query.ts        # Custom baseQuery для RPC
│   │   ├── rpc-api.example.ts       # Пример RPC API
│   │   └── README.md                # Документация API
│   │
│   ├── store/
│   │   ├── index.ts                 # Redux store
│   │   └── hooks.ts                 # Типизированные хуки
│   │
│   ├── middleware/
│   │   └── rtk-query-error-logger.ts # Глобальная обработка ошибок
│   │
│   └── utils/
│       └── handle-rtk-error.tsx     # Утилиты для ошибок
│
├── components/
│   ├── UsersList.example.tsx        # Пример REST API
│   ├── UserProfile.example.tsx      # Пример детальной страницы
│   └── RPCExample.tsx               # Пример RPC API
│
└── main.tsx                         # Redux Provider подключен
```

## 🚀 Быстрый старт

### Вариант 1: REST API (стандартный)

```typescript
// 1. Создайте API
import { baseApi } from './base-api'

export const myApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<User[], void>({
      query: () => '/users',
    }),
  }),
})

export const { useGetUsersQuery } = myApi

// 2. Используйте в компоненте
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()

  if (error) {
    return handleRtkError(error, {
      403: () => <div>Нет доступа</div>,
      404: () => <div>Не найдено</div>,
      default: () => <div>Ошибка</div>,
    })
  }

  return <div>{data?.map(user => <div>{user.name}</div>)}</div>
}
```

### Вариант 2: RPC API (единый POST endpoint)

```typescript
// 1. Создайте RPC API
import { createApi } from '@reduxjs/toolkit/query/react'
import { createRPCBaseQuery } from './rpc-base-query'

export const myApi = createApi({
  reducerPath: 'myApi',
  baseQuery: createRPCBaseQuery('/api', '/rpc'),
  endpoints: (build) => ({
    getUsers: build.query<User[], void>({
      query: () => ({
        method: 'users.list',
        params: {},
      }),
    }),
  }),
})

export const { useGetUsersQuery } = myApi

// 2. Добавьте в store
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

// 3. Используйте в компоненте (так же, как REST)
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()
  // ... остальной код идентичен
}
```

## 📖 Документация

### Обработка ошибок:

| Документ | Описание |
|----------|----------|
| **ERRORS_HANDLING_GUIDE.md** | Полное руководство по обработке ошибок |
| **QUICK_START_RU.md** | Быстрый старт на русском |
| **ERROR_FLOW_DIAGRAM.md** | Визуальные схемы и диаграммы |
| **RTK_ERROR_HANDLING_SUMMARY.md** | Краткое резюме |

### RPC API:

| Документ | Описание |
|----------|----------|
| **RPC_API_GUIDE.md** | Полное руководство по RPC API |
| **RPC_QUICK_START.md** | Быстрый старт для RPC |
| **RPC_FLOW_DIAGRAM.md** | Схемы работы RPC API |
| **RPC_IMPLEMENTATION_SUMMARY.md** | Краткое резюме |

### Примеры кода:

| Файл | Описание |
|------|----------|
| `src/shared/api/users-api.ts` | REST API примеры |
| `src/shared/api/rpc-api.example.ts` | RPC API примеры |
| `src/components/UsersList.example.tsx` | Компонент со списком (REST) |
| `src/components/UserProfile.example.tsx` | Детальная страница (REST) |
| `src/components/RPCExample.tsx` | Компонент с RPC API |

## 🎨 Сравнение REST vs RPC

### REST API:
```typescript
// Разные endpoints для разных операций
GET    /api/users          → useGetUsersQuery()
GET    /api/users/123      → useGetUserByIdQuery(123)
POST   /api/users          → useCreateUserMutation()
PUT    /api/users/123      → useUpdateUserMutation()
DELETE /api/users/123      → useDeleteUserMutation()
```

### RPC API:
```typescript
// Один endpoint, разные методы
POST /api/rpc
{ method: 'users.list' }    → useGetUsersQuery()

POST /api/rpc
{ method: 'users.get', params: { id: 123 } } → useGetUserByIdQuery(123)

POST /api/rpc
{ method: 'users.create', params: {...} } → useCreateUserMutation()
```

## 🛡️ Обработка ошибок (одинаково для REST и RPC)

### Глобально (middleware):
```typescript
// Автоматически обрабатывается:
401 → Редирект на /login
500+ → Логирование
FETCH_ERROR → Логирование
```

### Локально (компоненты):
```typescript
if (error && 'status' in error) {
  if (error.status === 403) {
    return <div>Нет доступа</div>
  }
  if (error.status === 404) {
    return <div>Не найдено</div>
  }
}
```

### С утилитой:
```typescript
return handleRtkError(error, {
  403: () => <AccessDenied />,
  404: () => <NotFound />,
  default: () => <GenericError />,
})
```

## ⚙️ Настройка

### API URL:
```bash
# .env
VITE_API_URL=https://api.example.com
```

### Toast уведомления:
```bash
pnpm add sonner
```

Раскомментируйте в `src/shared/middleware/rtk-query-error-logger.ts`:
```typescript
import { toast } from 'sonner'
toast.error('Ошибка сервера')
```

### Изменить логику 401:
```typescript
// src/shared/middleware/rtk-query-error-logger.ts
if (status === 401) {
  localStorage.removeItem('authToken')
  window.location.href = '/login' // ← измените здесь
}
```

## 🎯 Выбор подхода

### Используйте REST API, если:
- ✅ Бэкенд следует REST принципам
- ✅ Разные endpoints для разных ресурсов
- ✅ Стандартные HTTP методы (GET, POST, PUT, DELETE)

### Используйте RPC API, если:
- ✅ Бэкенд использует единый POST endpoint
- ✅ Все операции через один URL
- ✅ Методы передаются в теле запроса

## ✨ Особенности

### Общие для обоих подходов:
- ✅ Автоматическое кеширование
- ✅ Оптимистичные обновления
- ✅ Polling (автообновление)
- ✅ Prefetching (предзагрузка)
- ✅ Типизация TypeScript
- ✅ Обработка ошибок
- ✅ Авторизация

### Дополнительно для RPC:
- ✅ Единая точка входа
- ✅ Гибкость в добавлении методов
- ✅ Совместимость с JSON-RPC 2.0

## 🔗 Полезные ссылки

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Error Handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling)
- [Custom Queries](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries)
- [TypeScript](https://redux-toolkit.js.org/rtk-query/usage-with-typescript)

## 💡 Советы

1. **Начните с документации** - прочитайте QUICK_START_RU.md или RPC_QUICK_START.md
2. **Изучите примеры** - посмотрите готовые компоненты в `src/components/`
3. **Адаптируйте под себя** - измените baseQuery под ваш формат API
4. **Добавьте toast** - для лучшего UX установите библиотеку уведомлений
5. **Используйте TypeScript** - полная типизация избавит от ошибок

## 🚀 Что дальше?

1. Выберите подход (REST или RPC)
2. Создайте свой API в `src/shared/api/`
3. Добавьте его в store
4. Используйте хуки в компонентах
5. Наслаждайтесь автоматическим кешированием и обработкой ошибок!

---

**Вопросы?** Смотрите документацию в соответствующих MD файлах!
