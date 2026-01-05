# Thunks vs RTK Query - Сравнение

В проекте реализованы **два подхода** к авторизации. Выберите тот, который подходит вашему случаю.

## 🎯 Быстрое сравнение

| Критерий | Thunks | RTK Query |
|----------|--------|-----------|
| **Кеширование** | Вручную | Автоматически ✅ |
| **Дедупликация запросов** | Вручную | Автоматически ✅ |
| **Loading состояние** | Вручную | Автоматически ✅ |
| **Инвалидация кеша** | Вручную | По тегам ✅ |
| **Polling/Refetching** | Вручную | Встроено ✅ |
| **Оптимистичные обновления** | Сложно | Просто ✅ |
| **Boilerplate код** | Больше | Меньше ✅ |
| **Контроль** | Полный ✅ | Ограниченный |
| **Гибкость** | Высокая ✅ | Средняя |
| **Для REST API** | Подходит | Идеально ✅ |
| **Для сложной логики** | Идеально ✅ | Подходит |

## 📝 Примеры кода

### Thunks подход

```typescript
// 1. Создание thunk
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Добавление в slice
extraReducers: (builder) => {
  builder
    .addCase(loginAsync.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(loginAsync.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    })
    .addCase(loginAsync.rejected, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });
}

// 3. Использование
const dispatch = useAppDispatch();
const { user, isLoading, error } = useAppSelector(selectAuth);

const handleLogin = async () => {
  await dispatch(loginAsync({ email, password }));
};
```

**Строк кода:** ~50-60 строк

### RTK Query подход

```typescript
// 1. Создание API endpoint
export const authApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api/auth' }),
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

// 2. Использование
const [login, { isLoading, error }] = useLoginMutation();

const handleLogin = async () => {
  await login({ email, password });
};
```

**Строк кода:** ~15-20 строк ✅

## 🎨 Использование в компонентах

### Thunks

```typescript
import { useAuth } from '@/store/hooks/useAuth';

function MyComponent() {
  const {
    user,
    isLoading,
    error,
    login,
    logout,
  } = useAuth();

  // Вручную управляем состоянием
  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      // Обработка ошибки
    }
  };
}
```

### RTK Query

```typescript
import { useAuthRTK } from '@/store/hooks/useAuthRTK';

function MyComponent() {
  const {
    user,
    profile,      // Автоматически кешируется!
    isLoading,
    loginError,
    login,
    logout,
  } = useAuthRTK();

  // RTK Query автоматически управляет кешем
  const handleLogin = async () => {
    await login(email, password);
    // Профиль автоматически обновится
  };
}
```

## 🚀 Когда использовать что?

### Используйте Thunks когда:

✅ **Сложная бизнес-логика**
```typescript
// Пример: многошаговая авторизация с условиями
export const complexLoginFlow = createAsyncThunk(
  'auth/complexLogin',
  async (data, { dispatch, getState }) => {
    // Шаг 1: Проверка email
    const emailCheck = await checkEmail(data.email);
    
    if (emailCheck.requires2FA) {
      // Шаг 2: Отправка 2FA кода
      await send2FACode(data.email);
      dispatch(set2FARequired(true));
      return;
    }
    
    // Шаг 3: Обычный логин
    const result = await login(data);
    
    // Шаг 4: Загрузка дополнительных данных
    await dispatch(fetchUserPreferences());
    await dispatch(fetchUserNotifications());
    
    return result;
  }
);
```

✅ **Не REST API** (WebSocket, GraphQL, gRPC)
```typescript
export const subscribeToUpdates = createAsyncThunk(
  'auth/subscribe',
  async (_, { dispatch }) => {
    const ws = new WebSocket('ws://api.example.com');
    
    ws.onmessage = (event) => {
      dispatch(updateUser(JSON.parse(event.data)));
    };
  }
);
```

✅ **Полный контроль над запросами**
```typescript
export const loginWithRetry = createAsyncThunk(
  'auth/loginWithRetry',
  async (credentials, { rejectWithValue }) => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        return await authApi.login(credentials);
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          return rejectWithValue(error);
        }
        await delay(1000 * attempts); // Exponential backoff
      }
    }
  }
);
```

### Используйте RTK Query когда:

✅ **REST API с CRUD операциями**
```typescript
export const postsApi = createApi({
  endpoints: (build) => ({
    getPosts: build.query({ query: () => '/posts' }),
    getPost: build.query({ query: (id) => `/posts/${id}` }),
    createPost: build.mutation({ query: (body) => ({ url: '/posts', method: 'POST', body }) }),
    updatePost: build.mutation({ query: ({ id, ...body }) => ({ url: `/posts/${id}`, method: 'PUT', body }) }),
    deletePost: build.mutation({ query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }) }),
  }),
});
```

✅ **Нужно кеширование**
```typescript
// Данные автоматически кешируются
const { data: profile } = useGetProfileQuery();

// При повторном использовании - данные из кеша
const { data: sameProfile } = useGetProfileQuery(); // Без запроса!
```

✅ **Polling и автообновление**
```typescript
const { data: notifications } = useGetNotificationsQuery(undefined, {
  pollingInterval: 5000, // Обновлять каждые 5 секунд
});
```

✅ **Меньше boilerplate кода**
```typescript
// Одна строка вместо 50+ строк с thunks
const [updateProfile] = useUpdateProfileMutation();
```

## 📊 Производительность

### Thunks
- ❌ Каждый запрос выполняется заново
- ❌ Нужно вручную управлять кешем
- ❌ Дублирующиеся запросы не объединяются
- ✅ Полный контроль над оптимизацией

### RTK Query
- ✅ Автоматическое кеширование
- ✅ Дедупликация одинаковых запросов
- ✅ Автоматическая инвалидация
- ✅ Оптимизировано из коробки

## 🎯 Рекомендации

### Для нового проекта
**Начните с RTK Query** ⭐
- Меньше кода
- Автоматическая оптимизация
- Проще поддерживать

### Для существующего проекта
**Используйте оба подхода:**
- RTK Query для REST API
- Thunks для сложной логики

### Для обучения
**Начните с Thunks:**
- Понимание основ Redux
- Полный контроль
- Затем переходите на RTK Query

## 📁 Файлы в проекте

### Thunks
- `src/store/slices/authSlice.ts` - slice с thunks
- `src/store/hooks/useAuth.ts` - хук
- `src/components/examples/AuthExample.tsx` - пример
- `src/store/AUTH_GUIDE.md` - документация

### RTK Query
- `src/store/api/authApi.ts` - API определение
- `src/store/hooks/useAuthRTK.ts` - хук
- `src/components/examples/AuthRTKExample.tsx` - пример
- `src/store/RTK_QUERY_GUIDE.md` - документация

## 🔄 Миграция с Thunks на RTK Query

```typescript
// Было (Thunks):
export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
);

// Стало (RTK Query):
export const userApi = createApi({
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `/users/${id}`,
    }),
  }),
});

// Использование:
// Было:
const dispatch = useAppDispatch();
const user = useAppSelector(selectUser);
useEffect(() => {
  dispatch(fetchUser(id));
}, [id]);

// Стало:
const { data: user } = useGetUserQuery(id);
```

## 💡 Итог

**RTK Query** - современный подход для большинства случаев ⭐  
**Thunks** - когда нужен полный контроль

Оба подхода реализованы в проекте. Выбирайте подходящий!
