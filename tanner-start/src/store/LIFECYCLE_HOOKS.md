# RTK Query Lifecycle Hooks - Автоматическое обновление Redux Store

## Проблема

При использовании RTK Query приходилось вручную обновлять Redux store в каждом компоненте:

```typescript
// ❌ Плохо - дублирование кода
const [login] = useLoginMutation();
const dispatch = useAppDispatch();

const handleLogin = async () => {
  try {
    const result = await login({ email, password }).unwrap();
    // Вручную обновляем Redux store
    dispatch(setUser(result.user));
  } catch (error) {
    // Обработка ошибки
  }
};
```

## Решение - onQueryStarted

RTK Query предоставляет lifecycle хуки, которые позволяют автоматически обновлять Redux store прямо в API определении:

```typescript
// ✅ Хорошо - логика в одном месте
login: build.mutation({
  async queryFn(credentials) {
    // API запрос
  },
  // Автоматически обновляем Redux store
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
    } catch {
      // Ошибка уже обработана RTK Query
    }
  },
}),
```

Теперь в компонентах просто:

```typescript
// ✅ Просто и чисто
const [login] = useLoginMutation();

const handleLogin = async () => {
  await login({ email, password }).unwrap();
  // Redux store обновляется автоматически!
};
```

## Реализация в проекте

### 1. API с lifecycle хуками

`src/store/api/authApi.ts`:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUser, clearUser } from '../slices/authSlice';

export const authApi = createApi({
  // ...
  endpoints: (build) => ({
    // Login
    login: build.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      // Автоматически сохраняем пользователя
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // Ошибка уже обработана
        }
      },
    }),

    // Logout
    logout: build.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      // Автоматически очищаем пользователя
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearUser());
        } catch {
          // Даже при ошибке очищаем
          dispatch(clearUser());
        }
      },
    }),

    // Refresh Token
    refreshToken: build.mutation({
      query: (body) => ({
        url: '/refresh',
        method: 'POST',
        body,
      }),
      // Автоматически обновляем токены
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as { auth?: { user?: AuthUser } };
          const currentUser = state.auth?.user;
          
          if (currentUser) {
            dispatch(setUser({
              ...currentUser,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }));
          }
        } catch {
          // При ошибке выходим из системы
          dispatch(clearUser());
        }
      },
    }),
  }),
});
```

### 2. Упрощённый хук

`src/store/hooks/useAuthRTK.ts`:

```typescript
export const useAuthRTK = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  // Простые обёртки без dispatch
  const login = useCallback(
    async (email: string, password: string) => {
      // Redux store обновляется автоматически!
      return await loginMutation({ email, password }).unwrap();
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    // Redux store очищается автоматически!
    return await logoutMutation().unwrap();
  }, [logoutMutation]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};
```

### 3. Использование в компонентах

```typescript
function LoginPage() {
  const { user, isAuthenticated, login, logout } = useAuthRTK();

  const handleLogin = async () => {
    // Просто вызываем - всё остальное автоматически!
    await login('user@example.com', 'password');
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

## Преимущества

✅ **Меньше кода** - не нужно dispatch в каждом компоненте  
✅ **Централизация** - вся логика обновления в одном месте  
✅ **Меньше ошибок** - невозможно забыть обновить store  
✅ **Проще тестировать** - логика изолирована в API  
✅ **Легче поддерживать** - изменения в одном месте  
✅ **Возможность переопределить** - можно добавить кастомную логику снаружи  

## onQueryStarted API

```typescript
async onQueryStarted(
  arg,                    // Аргументы запроса
  {
    dispatch,             // Redux dispatch
    getState,             // Получить текущий state
    queryFulfilled,       // Promise с результатом
    getCacheEntry,        // Получить кеш
    updateCachedData,     // Обновить кеш (оптимистичные обновления)
    requestId,            // ID запроса
    extra,                // Дополнительные данные
  }
) {
  // Ваша логика
}
```

## Оптимистичные обновления

Можно обновлять UI до получения ответа от сервера:

```typescript
updateProfile: build.mutation({
  query: (updates) => ({
    url: '/profile',
    method: 'PATCH',
    body: updates,
  }),
  async onQueryStarted(updates, { dispatch, queryFulfilled }) {
    // Оптимистично обновляем UI
    const patchResult = dispatch(
      authApi.util.updateQueryData('getProfile', undefined, (draft) => {
        Object.assign(draft, updates);
      })
    );
    
    try {
      await queryFulfilled;
      // Успех - изменения остаются
    } catch {
      // Ошибка - откатываем изменения
      patchResult.undo();
    }
  },
}),
```

## Обработка ошибок

### Способ 1: try-catch (классический)

```typescript
const { login } = useAuthRTK();

const handleLogin = async () => {
  try {
    await login(email, password);
    // Успех - Redux store уже обновлён
    toast.success('Вход выполнен!');
  } catch (error) {
    // Ошибка - обрабатываем как обычно
    console.error('Login failed:', error);
    toast.error('Неверный email или пароль');
  }
};
```

### Способ 2: Через состояние из хука (рекомендуется)

```typescript
const { login, loginError, isLoading } = useAuthRTK();

const handleLogin = async () => {
  await login(email, password);
  // Ошибка автоматически попадёт в loginError
};

return (
  <div>
    {loginError && 'status' in loginError && (
      <div className="error">
        {loginError.status}: {loginError.data?.message}
      </div>
    )}
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Login'}
    </button>
  </div>
);
```

### Способ 3: Прямое использование mutation

```typescript
const [login, { error, isLoading, isError, isSuccess }] = useLoginMutation();

const handleLogin = async () => {
  await login({ email, password });
  // Redux store обновляется автоматически
};

return (
  <div>
    {isError && error && (
      <div className="error">Error: {error.status}</div>
    )}
    {isSuccess && <div>Success!</div>}
  </div>
);
```

### Способ 4: Комбинированный подход

```typescript
const { login, loginError } = useAuthRTK();

const handleLogin = async () => {
  try {
    const result = await login(email, password);
    // Успех - можно добавить кастомную логику
    console.log('Login result:', result);
    navigate('/dashboard');
  } catch (error) {
    // Дополнительная обработка ошибки
    if (error.status === 401) {
      toast.error('Неверные учётные данные');
    } else if (error.status === 429) {
      toast.error('Слишком много попыток. Попробуйте позже');
    }
  }
};

// Также можно показать ошибку из состояния
return (
  <div>
    {loginError && <ErrorDisplay error={loginError} />}
    <button onClick={handleLogin}>Login</button>
  </div>
);
```

## Возможность переопределения

Если нужна кастомная логика в конкретном компоненте:

```typescript
// Стандартное использование
await login(email, password);
// Redux store обновляется автоматически

// Кастомная логика после успеха
try {
  const result = await login(email, password);
  // Можно добавить дополнительную логику
  console.log('Custom logic after login:', result);
  analytics.track('user_logged_in');
  navigate('/dashboard');
} catch (error) {
  // Кастомная обработка ошибок
  logErrorToService(error);
}
```

## Сравнение подходов

### Без lifecycle хуков

```typescript
// API
login: build.mutation({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
}),

// Хук
const login = useCallback(async (email, password) => {
  try {
    const result = await loginMutation({ email, password }).unwrap();
    dispatch(setUser(result.user));  // Вручную
    return result;
  } catch (error) {
    throw error;
  }
}, [loginMutation, dispatch]);

// Компонент
const handleLogin = async () => {
  try {
    await login(email, password);
  } catch (error) {
    // Обработка
  }
};
```

**Строк кода:** ~20-25

### С lifecycle хуками ⭐

```typescript
// API
login: build.mutation({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));  // Один раз здесь
    } catch {}
  },
}),

// Хук
const login = useCallback(async (email, password) => {
  return await loginMutation({ email, password }).unwrap();
}, [loginMutation]);

// Компонент
const handleLogin = async () => {
  await login(email, password);  // Просто!
};
```

**Строк кода:** ~15 (на 30% меньше)

## Когда использовать

✅ **Используйте lifecycle хуки когда:**
- Нужно обновлять Redux store после API запросов
- Логика обновления одинакова везде
- Хотите меньше boilerplate кода
- Нужны оптимистичные обновления

❌ **Не используйте когда:**
- Логика обновления разная в разных местах
- Нужен полный контроль в компоненте
- Простые локальные операции без API

## Итог

Lifecycle хуки RTK Query (`onQueryStarted`) позволяют:
- Писать меньше кода
- Централизовать логику
- Избежать ошибок
- Упростить поддержку

Это **рекомендуемый подход** для работы с RTK Query в проекте! ⭐
