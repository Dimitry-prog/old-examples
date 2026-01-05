# Auth Slice - Руководство

Полноценная система авторизации на Redux Toolkit с async thunks.

## Быстрый старт

### 1. Использование хука useAuth (рекомендуется)

```typescript
import { useAuth } from '@/store/hooks/useAuth';

function LoginPage() {
  const { user, isAuthenticated, login, logout, error } = useAuth();

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
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### 2. Прямое использование Redux

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAsync, selectUser } from '@/store/slices/authSlice';

function LoginPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleLogin = async () => {
    await dispatch(loginAsync({ 
      email: 'user@example.com', 
      password: 'password123' 
    })).unwrap();
  };
}
```

## Доступные методы

### useAuth хук

```typescript
const {
  // Состояние
  user,              // AuthUser | null
  isAuthenticated,   // boolean
  isLoading,         // boolean
  error,             // string | null
  
  // Действия
  login,             // (email, password) => Promise<void>
  logout,            // () => Promise<void>
  refreshTokens,     // () => Promise<void>
  fetchProfile,      // () => Promise<AuthUser>
  clearError,        // () => void
  
  // Утилиты
  hasRole,           // (role) => boolean
  canAccess,         // (requiredRole?) => boolean
} = useAuth();
```

## Проверка прав доступа

### Иерархия ролей

```
admin (3) > moderator (2) > user (1)
```

### Примеры

```typescript
const { user, hasRole, canAccess } = useAuth();

// Точная проверка роли
if (hasRole('admin')) {
  // Только для admin
}

// Проверка с учётом иерархии
if (canAccess('moderator')) {
  // Для moderator и admin
}

if (canAccess()) {
  // Для любого авторизованного пользователя
}
```

## Async Thunks

### loginAsync

```typescript
dispatch(loginAsync({ email, password }))
  .unwrap()
  .then((result) => {
    console.log('Login success:', result.user);
  })
  .catch((error) => {
    console.error('Login failed:', error);
  });
```

### logoutAsync

```typescript
dispatch(logoutAsync())
  .unwrap()
  .then(() => {
    console.log('Logout success');
  });
```

### refreshTokensAsync

```typescript
dispatch(refreshTokensAsync(user.refreshToken))
  .unwrap()
  .then((tokens) => {
    console.log('Tokens refreshed:', tokens);
  });
```

### fetchProfileAsync

```typescript
dispatch(fetchProfileAsync())
  .unwrap()
  .then((profile) => {
    console.log('Profile loaded:', profile);
  });
```

## Селекторы

```typescript
import { 
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from '@/store/slices/authSlice';

const auth = useAppSelector(selectAuth);
const user = useAppSelector(selectUser);
const isAuthenticated = useAppSelector(selectIsAuthenticated);
```

## Утилиты (authUtils.ts)

```typescript
import {
  hasRole,
  canAccess,
  isTokenExpired,
  formatUserName,
  getUserInitials,
  isValidEmail,
  getPasswordStrength,
} from '@/store/slices/authUtils';

// Проверка роли
hasRole(user, 'admin'); // boolean

// Проверка прав
canAccess(user, 'moderator'); // boolean

// Валидация email
isValidEmail('test@example.com'); // boolean

// Сила пароля
const { score, label } = getPasswordStrength('MyPass123!');
// { score: 5, label: 'strong' }

// Инициалы
getUserInitials(user); // "JD"
```

## Интеграция с API

В реальном приложении замените mock-запросы на реальные:

```typescript
// src/store/slices/authSlice.ts

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Замените на реальный API запрос
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Примеры компонентов

Смотрите готовые примеры:

- `src/components/examples/AuthExample.tsx` - прямое использование Redux
- `src/components/examples/AuthHookExample.tsx` - использование хука useAuth

## Тестирование

```typescript
// Тест для ошибки входа
await login('error@test.com', 'password');
// Вернёт ошибку: "Неверный email или пароль"
```

## Структура файлов

```
src/store/
├── slices/
│   ├── authSlice.ts       # Основной slice с thunks
│   └── authUtils.ts       # Утилиты для работы с auth
├── hooks/
│   └── useAuth.ts         # Кастомный хук
└── store.ts               # Конфигурация store
```
