# Redux Toolkit - Быстрый старт

## 🚀 Выберите подход

### RTK Query (Рекомендуется) ⭐

```typescript
import { useAuthRTK } from '@/store/hooks/useAuthRTK';
import toast from 'react-hot-toast';

function App() {
  const { user, isAuthenticated, login, logout } = useAuthRTK();

  const handleLogin = async () => {
    try {
      await login('email', 'password');
      // Redux store обновляется автоматически!
      // UI логика в компоненте
      toast.success('Добро пожаловать!');
    } catch (error) {
      toast.error('Ошибка входа');
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Thunks (Классический подход)

```typescript
import { useAuth } from '@/store/hooks/useAuth';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('email', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

## 📚 Документация

- **README.md** - Основная документация
- **RTK_QUERY_GUIDE.md** - Руководство по RTK Query ⭐
- **LIFECYCLE_HOOKS.md** - Автоматическое обновление Redux store ⭐
- **CLEAN_ARCHITECTURE.md** - Чистая архитектура ⭐
- **ERROR_HANDLING_STRATEGY.md** - Стратегия обработки ошибок ⭐
- **AUTH_GUIDE.md** - Руководство по Thunks
- **COMPARISON.md** - Сравнение подходов
- **STRUCTURE.md** - Структура проекта

## 🎯 Примеры

Откройте файлы в `src/components/examples/`:
- `AuthRTKExample.tsx` - RTK Query ⭐
- `AuthHookExample.tsx` - Thunks
- `ReduxExample.tsx` - Базовый Redux

## 🛠️ Создание нового slice

### Простой slice

```typescript
// src/store/slices/counterSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
```

### Добавить в store

```typescript
// src/store/store.ts
import counterReducer from './slices/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // добавьте здесь
  },
});
```

### Использовать

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { increment } from '@/store/slices/counterSlice';

function Counter() {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.counter.value);

  return (
    <div>
      <p>Count: {value}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
    </div>
  );
}
```

## 🌐 Создание API (RTK Query)

```typescript
// src/store/api/postsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (build) => ({
    getPosts: build.query({
      query: () => '/posts',
    }),
    createPost: build.mutation({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetPostsQuery, useCreatePostMutation } = postsApi;
```

### Добавить в store

```typescript
// src/store/store.ts
import { postsApi } from './api/postsApi';

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
```

### Использовать

```typescript
import { useGetPostsQuery, useCreatePostMutation } from '@/store/api/postsApi';

function Posts() {
  const { data: posts, isLoading } = useGetPostsQuery();
  const [createPost] = useCreatePostMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      <button onClick={() => createPost({ title: 'New Post' })}>
        Add Post
      </button>
    </div>
  );
}
```

## 🎨 Доступные хуки

```typescript
// Redux хуки
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';

// Auth хуки
import { useAuth } from '@/store/hooks/useAuth';           // Thunks
import { useAuthRTK } from '@/store/hooks/useAuthRTK';     // RTK Query ⭐

// RTK Query хуки (генерируются автоматически)
import {
  useLoginMutation,
  useGetProfileQuery,
  // ... и другие
} from '@/store/api/authApi';
```

## 🔧 Интеграция с реальным API

### RTK Query

Замените `queryFn` на `query` в `src/store/api/authApi.ts`:

```typescript
// Было (mock):
login: build.mutation({
  async queryFn(credentials) {
    // mock implementation
  },
}),

// Станет (real API):
login: build.mutation({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
}),
```

### Thunks

Замените mock запросы в `src/store/slices/authSlice.ts`:

```typescript
// Было (mock):
await new Promise(resolve => setTimeout(resolve, 1000));
const mockUser = { ... };

// Станет (real API):
const response = await authApi.login(credentials);
return response.data;
```

## 📖 Дальнейшее чтение

1. Начните с **RTK_QUERY_GUIDE.md** для современного подхода
2. Изучите **COMPARISON.md** для выбора подхода
3. Смотрите примеры в `src/components/examples/`
4. Читайте официальную документацию: https://redux-toolkit.js.org/

## 💡 Советы

✅ Используйте RTK Query для REST API  
✅ Используйте Thunks для сложной логики  
✅ Всегда используйте типизированные хуки (`useAppDispatch`, `useAppSelector`)  
✅ Создавайте кастомные хуки для удобства (как `useAuth`)  
✅ Группируйте связанные slices в папки  

Удачи! 🚀
