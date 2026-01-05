# Redux Toolkit Setup

Redux Toolkit полностью настроен и готов к использованию в проекте.

## Структура

```
src/store/
├── store.ts              # Конфигурация Redux store
├── hooks.ts              # Типизированные хуки (useAppDispatch, useAppSelector)
├── slices/
│   └── exampleSlice.ts   # Пример slice
└── README.md
```

## Использование

### 1. Создание нового slice

```typescript
// src/store/slices/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
}

const initialState: UserState = {
  name: '',
  email: '',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### 2. Добавление slice в store

```typescript
// src/store/store.ts
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    example: exampleReducer,
    user: userReducer, // добавьте новый reducer
  },
});
```

### 3. Использование в компонентах

```typescript
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, clearUser } from '../../store/slices/userSlice';

function UserProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const handleLogin = () => {
    dispatch(setUser({ name: 'John', email: 'john@example.com' }));
  };

  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => dispatch(clearUser())}>Logout</button>
    </div>
  );
}
```

## Async Actions (Thunks)

Для асинхронных операций используйте `createAsyncThunk`:

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

## Auth Slice - Авторизация

Полноценный slice для авторизации с async thunks уже настроен в `src/store/slices/authSlice.ts`.

### Использование в компонентах

```typescript
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loginAsync,
  logoutAsync,
  selectUser,
  selectIsAuthenticated,
} from '../../store/slices/authSlice';

function LoginForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogin = async () => {
    try {
      await dispatch(loginAsync({ 
        email: 'user@example.com', 
        password: 'password' 
      })).unwrap();
      // Успешный вход
    } catch (error) {
      // Обработка ошибки
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Доступные async thunks

- `loginAsync({ email, password })` - вход в систему
- `logoutAsync()` - выход из системы
- `refreshTokensAsync(refreshToken)` - обновление токенов
- `fetchProfileAsync()` - загрузка профиля пользователя

### Доступные селекторы

- `selectAuth` - всё состояние auth
- `selectUser` - данные пользователя
- `selectIsAuthenticated` - статус авторизации
- `selectIsLoading` - статус загрузки
- `selectAuthError` - ошибка авторизации

### Кастомный хук useAuth

Для упрощения работы создан хук `useAuth`:

```typescript
import { useAuth } from '../../store/hooks/useAuth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    canAccess,
  } = useAuth();

  // Простое использование
  const handleLogin = async () => {
    await login('email@example.com', 'password');
  };

  // Проверка прав
  if (hasRole('admin')) {
    // Показать админ панель
  }

  if (canAccess('moderator')) {
    // Доступ разрешён для moderator и выше
  }
}
```

### Утилиты (authUtils.ts)

- `hasRole(user, role)` - проверка роли
- `canAccess(user, requiredRole)` - проверка прав с учётом иерархии
- `isTokenExpired(token)` - проверка истечения токена
- `formatUserName(user)` - форматирование имени
- `getUserInitials(user)` - получение инициалов
- `isValidEmail(email)` - валидация email
- `getPasswordStrength(password)` - проверка силы пароля

## RTK Query - Современный подход

Для работы с API рекомендуется использовать RTK Query вместо thunks:

```typescript
import { useAuthRTK } from '../../store/hooks/useAuthRTK';

function MyComponent() {
  const {
    user,
    profile,      // Автоматически кешируется!
    login,
    logout,
  } = useAuthRTK();

  // RTK Query автоматически управляет:
  // - Кешированием данных
  // - Дедупликацией запросов
  // - Loading/error состояниями
  // - Инвалидацией кеша
}
```

Подробнее: `src/store/RTK_QUERY_GUIDE.md`

## Примеры компонентов

- `src/components/examples/ReduxExample.tsx` - базовый пример Redux
- `src/components/examples/AuthExample.tsx` - авторизация с Thunks
- `src/components/examples/AuthHookExample.tsx` - авторизация с хуком useAuth
- `src/components/examples/AuthRTKExample.tsx` - авторизация с RTK Query ⭐ (рекомендуется)

## useAppStore - когда использовать?

`useAppStore` даёт прямой доступ к объекту store. Используйте **только в редких случаях**:

### ❌ НЕ используйте для чтения состояния

```typescript
// Плохо - компонент не будет ре-рендериться!
const store = useAppStore();
const value = store.getState().example.value;

// Хорошо - используйте useAppSelector
const value = useAppSelector((state) => state.example.value);
```

### ✅ Используйте для специальных случаев

**1. Подписка на изменения store:**
```typescript
const store = useAppStore();

useEffect(() => {
  const unsubscribe = store.subscribe(() => {
    console.log('State changed:', store.getState());
  });
  return unsubscribe;
}, [store]);
```

**2. Интеграция с внешними библиотеками:**
```typescript
const store = useAppStore();

useEffect(() => {
  const ws = new WebSocket('ws://api.example.com');
  ws.onmessage = (event) => {
    store.dispatch(JSON.parse(event.data));
  };
}, [store]);
```

**3. Динамическое добавление reducers:**
```typescript
const store = useAppStore();

useEffect(() => {
  // Загружаем reducer динамически
  import('./lazySlice').then((module) => {
    store.replaceReducer({
      ...store.getState(),
      lazy: module.default
    });
  });
}, [store]);
```

## Документация

- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Redux](https://react-redux.js.org/)
