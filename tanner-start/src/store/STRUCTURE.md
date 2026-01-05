# Redux Store - Структура проекта

## Файловая структура

```
src/store/
├── api/                       # RTK Query APIs
│   └── authApi.ts            # ✅ Auth API (RTK Query) ⭐
│
├── slices/                    # Redux slices
│   ├── authSlice.ts          # ✅ Авторизация (async thunks)
│   ├── authUtils.ts          # ✅ Утилиты для auth
│   └── exampleSlice.ts       # ✅ Пример базового slice
│
├── hooks/                     # Кастомные хуки
│   ├── useAuth.ts            # ✅ Хук для Thunks
│   └── useAuthRTK.ts         # ✅ Хук для RTK Query ⭐
│
├── hooks.ts                   # ✅ Типизированные Redux хуки
├── store.ts                   # ✅ Конфигурация store + RTK Query
├── README.md                  # 📖 Основная документация
├── AUTH_GUIDE.md             # 📖 Руководство по авторизации (Thunks)
├── RTK_QUERY_GUIDE.md        # 📖 Руководство по RTK Query ⭐
└── STRUCTURE.md              # 📖 Этот файл

src/components/examples/
├── ReduxExample.tsx          # ✅ Пример базового использования
├── AuthExample.tsx           # ✅ Пример авторизации (Thunks)
├── AuthHookExample.tsx       # ✅ Пример авторизации (useAuth)
└── AuthRTKExample.tsx        # ✅ Пример авторизации (RTK Query) ⭐
```

## Что уже настроено

### ✅ Redux Store
- Конфигурация с TypeScript типами
- Автоматическая интеграция Redux DevTools
- Middleware: thunk + RTK Query

### ✅ RTK Query API ⭐ (Рекомендуется)
- Автоматическое кеширование данных
- Дедупликация запросов
- Автоматическая инвалидация кеша
- Login, Register, Logout, Refresh Tokens, Profile
- Встроенная обработка loading/error

### ✅ Auth Slice (Thunks)
- Полноценная авторизация с async thunks
- Login, Logout, Refresh Tokens, Fetch Profile
- Обработка ошибок и loading состояний
- Селекторы для удобного доступа к данным

### ✅ Хуки
- `useAppDispatch` - типизированный dispatch
- `useAppSelector` - типизированный selector
- `useAppStore` - доступ к store (редко используется)
- `useAuth` - хук для авторизации (Thunks)
- `useAuthRTK` - хук для авторизации (RTK Query) ⭐

### ✅ Утилиты
- Проверка ролей и прав доступа
- Валидация email и пароля
- Форматирование имени пользователя
- Работа с токенами

### ✅ Примеры
- Базовый пример Redux (counter, text)
- Пример авторизации (Thunks)
- Пример авторизации (useAuth хук)
- Пример авторизации (RTK Query) ⭐

## Как использовать

### 1. Для простых данных (counter, settings, etc.)

Создайте slice по примеру `exampleSlice.ts`:

```typescript
// src/store/slices/settingsSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { theme: 'light' },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
```

Добавьте в store:

```typescript
// src/store/store.ts
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer, // добавьте здесь
  },
});
```

### 2. Для асинхронных операций (API запросы)

Используйте `createAsyncThunk` по примеру `authSlice.ts`:

```typescript
export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async () => {
    const response = await api.getUsers();
    return response.data;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});
```

### 3. Для авторизации

Используйте готовый `useAuth` хук:

```typescript
import { useAuth } from '@/store/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Готово к использованию!
}
```

## Следующие шаги

1. **Замените mock API на реальные запросы** в `authSlice.ts`
2. **Создайте новые slices** для вашей бизнес-логики
3. **Добавьте persistence** если нужно (redux-persist)
4. **Настройте middleware** если требуется (logger, analytics)

## Полезные ссылки

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [TypeScript with Redux](https://redux.js.org/usage/usage-with-typescript)
