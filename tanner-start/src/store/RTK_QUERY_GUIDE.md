# RTK Query Auth - Руководство

Современный подход к авторизации с использованием RTK Query для автоматического кеширования и оптимизации запросов.

## Преимущества RTK Query

✅ **Автоматическое кеширование** - данные кешируются автоматически  
✅ **Дедупликация запросов** - одинаковые запросы объединяются  
✅ **Автоматическая инвалидация** - кеш обновляется при изменениях  
✅ **Оптимистичные обновления** - UI обновляется до ответа сервера  
✅ **Polling & Refetching** - автоматическое обновление данных  
✅ **Встроенные loading/error** - не нужно управлять вручную  

## Быстрый старт

### 1. Использование хука useAuthRTK (рекомендуется)

```typescript
import { useAuthRTK } from '@/store/hooks/useAuthRTK';

function LoginPage() {
  const {
    user,
    profile,        // Автоматически кешируется!
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  } = useAuthRTK();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Успешный вход
    } catch (err) {
      // Обработка ошибки
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <p>Server profile: {profile?.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Прямое использование RTK Query хуков

```typescript
import {
  useLoginMutation,
  useGetProfileQuery,
} from '@/store/api/authApi';

function LoginPage() {
  const [login, { isLoading, error }] = useLoginMutation();
  
  // Профиль загружается автоматически и кешируется
  const { data: profile } = useGetProfileQuery();

  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password' });
  };
}
```

## Доступные хуки

### Mutations (изменение данных)

```typescript
const [login, { isLoading, error, data }] = useLoginMutation();
const [register, { isLoading, error }] = useRegisterMutation();
const [logout, { isLoading }] = useLogoutMutation();
const [refreshToken, { isLoading }] = useRefreshTokenMutation();
const [updateProfile, { isLoading }] = useUpdateProfileMutation();
```

### Queries (получение данных)

```typescript
const {
  data: profile,
  isLoading,
  error,
  refetch,
} = useGetProfileQuery(undefined, {
  skip: !isAuthenticated,  // Не загружать если не авторизован
  pollingInterval: 30000,  // Обновлять каждые 30 сек
});
```

## useAuthRTK API

```typescript
const {
  // Состояние
  user,              // AuthUser | null - локальное состояние
  profile,           // AuthUser | undefined - с сервера (кешируется)
  isAuthenticated,   // boolean
  isLoading,         // boolean - общий статус загрузки
  
  // Ошибки
  loginError,        // SerializedError | FetchBaseQueryError
  registerError,     // SerializedError | FetchBaseQueryError
  profileError,      // SerializedError | FetchBaseQueryError
  
  // Действия
  login,             // (email, password) => Promise<LoginResponse>
  register,          // (email, password, name) => Promise<LoginResponse>
  logout,            // () => Promise<void>
  refreshTokens,     // () => Promise<RefreshTokenResponse>
  updateProfile,     // (updates) => Promise<AuthUser>
  refetchProfile,    // () => Promise<QueryActionCreatorResult>
  
  // Утилиты
  hasRole,           // (role) => boolean
  canAccess,         // (requiredRole?) => boolean
} = useAuthRTK();
```

## Кеширование и инвалидация

RTK Query автоматически управляет кешем с помощью тегов:

```typescript
// При логине инвалидируются теги 'Auth' и 'Profile'
login: build.mutation({
  // ...
  invalidatesTags: ['Auth', 'Profile'],
}),

// Профиль предоставляет тег 'Profile'
getProfile: build.query({
  // ...
  providesTags: ['Profile'],
}),
```

Это означает:
- После логина профиль автоматически перезагрузится
- Данные кешируются и переиспользуются
- Не нужно вручную управлять обновлениями

## Продвинутые возможности

### Polling (автообновление)

```typescript
const { data: profile } = useGetProfileQuery(undefined, {
  pollingInterval: 30000, // Обновлять каждые 30 секунд
});
```

### Skip (условная загрузка)

```typescript
const { data: profile } = useGetProfileQuery(undefined, {
  skip: !isAuthenticated, // Не загружать если не авторизован
});
```

### Refetch on Focus

```typescript
const { data: profile } = useGetProfileQuery(undefined, {
  refetchOnFocus: true, // Обновлять при возврате на вкладку
});
```

### Оптимистичные обновления

```typescript
updateProfile: build.mutation({
  async onQueryStarted(updates, { dispatch, queryFulfilled }) {
    // Оптимистично обновляем UI
    const patchResult = dispatch(
      authApi.util.updateQueryData('getProfile', undefined, (draft) => {
        Object.assign(draft, updates);
      })
    );
    
    try {
      await queryFulfilled;
    } catch {
      // Откатываем при ошибке
      patchResult.undo();
    }
  },
}),
```

## Интеграция с реальным API

Замените `queryFn` на `query` в `src/store/api/authApi.ts`:

```typescript
// Было (симуляция):
login: build.mutation<LoginResponse, LoginRequest>({
  async queryFn(credentials) {
    // mock implementation
  },
}),

// Станет (реальный API):
login: build.mutation<LoginResponse, LoginRequest>({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
  invalidatesTags: ['Auth', 'Profile'],
}),
```

## Обработка ошибок

```typescript
const [login, { error }] = useLoginMutation();

// error может быть:
// 1. FetchBaseQueryError (ошибка сети/HTTP)
if (error && 'status' in error) {
  console.log('HTTP Error:', error.status);
  console.log('Message:', error.data);
}

// 2. SerializedError (другие ошибки)
if (error && 'message' in error) {
  console.log('Error:', error.message);
}
```

## Сравнение с Thunks

| Функция | Thunks | RTK Query |
|---------|--------|-----------|
| Кеширование | Вручную | Автоматически ✅ |
| Дедупликация | Вручную | Автоматически ✅ |
| Loading состояние | Вручную | Автоматически ✅ |
| Инвалидация | Вручную | По тегам ✅ |
| Polling | Вручную | Встроено ✅ |
| Оптимистичные обновления | Сложно | Просто ✅ |

## Примеры компонентов

Смотрите готовые примеры:

- `src/components/examples/AuthRTKExample.tsx` - полный пример с RTK Query
- `src/components/examples/AuthExample.tsx` - пример с Thunks (для сравнения)

## Структура файлов

```
src/store/
├── api/
│   └── authApi.ts             # RTK Query API определение
├── hooks/
│   ├── useAuth.ts             # Хук для Thunks
│   └── useAuthRTK.ts          # Хук для RTK Query ✅
├── slices/
│   └── authSlice.ts           # Redux slice (используется обоими)
└── store.ts                   # Store с RTK Query middleware
```

## Когда использовать RTK Query?

✅ **Используйте RTK Query когда:**
- Работаете с REST API
- Нужно кеширование данных
- Много повторяющихся запросов
- Нужны polling/refetching
- Хотите меньше boilerplate кода

❌ **Используйте Thunks когда:**
- Сложная бизнес-логика
- Не REST API (WebSocket, GraphQL)
- Нужен полный контроль над запросами
- Простые локальные операции

## Дополнительные ресурсы

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query Usage Guide](https://redux-toolkit.js.org/rtk-query/usage/queries)
- [Mutations](https://redux-toolkit.js.org/rtk-query/usage/mutations)
- [Cache Behavior](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior)
