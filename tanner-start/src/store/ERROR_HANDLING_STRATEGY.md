# Стратегия обработки ошибок - Правильный подход

## Проблема

Нужно обрабатывать два типа ошибок:

1. **Ожидаемые** (401, 403, 404) - обрабатываются в компонентах
2. **Непредвиденные** (502, 504, network errors) - нужна глобальная обработка

## Решение - Двухуровневая обработка

### Уровень 1: Глобальный Middleware (непредвиденные ошибки)

Ловит критические ошибки автоматически:

```typescript
// src/store/middleware/errorMiddleware.ts
import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

export const rtkQueryErrorLogger: Middleware =
  (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const error = action.payload;
      
      if (error && 'status' in error) {
        const status = error.status;
        
        // Серверные ошибки (500+)
        if (status >= 500) {
          toast.error(`Сервер недоступен (${status})`);
        }
        
        // Сетевые ошибки
        if (status === 'FETCH_ERROR') {
          toast.error('Проверьте подключение к интернету');
        }
        
        // Timeout
        if (status === 'TIMEOUT_ERROR') {
          toast.error('Сервер не отвечает');
        }
      }
    }
    
    return next(action);
  };
```

### Уровень 2: Компоненты (ожидаемые ошибки)

Обрабатывают специфичные ошибки:

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Добро пожаловать!');
  } catch (error: any) {
    // Обрабатываем только ожидаемые ошибки
    if (error?.status === 401) {
      toast.error('Неверный email или пароль');
    } else if (error?.status === 429) {
      toast.error('Слишком много попыток');
    }
    // Остальные ошибки обработаны middleware
  }
};
```

## Реализация

### 1. Создайте middleware

`src/store/middleware/errorMiddleware.ts`:

```typescript
import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

export const rtkQueryErrorLogger: Middleware =
  (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const error = action.payload;
      
      if (error && 'status' in error) {
        const status = error.status;
        
        // Непредвиденные серверные ошибки
        if (typeof status === 'number' && status >= 500) {
          showGlobalError({
            title: 'Ошибка сервера',
            message: `Сервер временно недоступен (${status})`,
          });
          return next(action);
        }
        
        // Сетевые ошибки
        if (status === 'FETCH_ERROR') {
          showGlobalError({
            title: 'Ошибка подключения',
            message: 'Проверьте подключение к интернету',
          });
          return next(action);
        }
        
        // Timeout
        if (status === 'TIMEOUT_ERROR') {
          showGlobalError({
            title: 'Превышено время ожидания',
            message: 'Сервер не отвечает',
          });
          return next(action);
        }
      }
    }
    
    return next(action);
  };

function showGlobalError(error: { title: string; message: string }) {
  // Используйте вашу toast библиотеку
  console.error('🚨 Global Error:', error);
  // toast.error(`${error.title}: ${error.message}`);
}
```

### 2. Добавьте middleware в store

`src/store/store.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { rtkQueryErrorLogger } from './middleware/errorMiddleware';

export const store = configureStore({
  reducer: {
    // ... ваши reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(rtkQueryErrorLogger), // Добавляем глобальный обработчик
});
```

### 3. Обрабатывайте ожидаемые ошибки в компонентах

```typescript
function LoginForm() {
  const { login } = useAuthRTK();

  const handleLogin = async () => {
    try {
      await login(email, password);
      toast.success('Добро пожаловать!');
      navigate('/dashboard');
    } catch (error: any) {
      // Обрабатываем только ожидаемые ошибки
      switch (error?.status) {
        case 401:
          toast.error('Неверный email или пароль');
          break;
        case 403:
          toast.error('Ваш аккаунт заблокирован');
          break;
        case 429:
          toast.error('Слишком много попыток. Подождите 5 минут');
          break;
        // Остальные ошибки (500+, network) обработаны middleware
      }
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## Какие ошибки где обрабатывать

### Middleware (автоматически)

✅ **500-599** - Серверные ошибки  
✅ **FETCH_ERROR** - Сетевые ошибки  
✅ **TIMEOUT_ERROR** - Timeout  
✅ **PARSING_ERROR** - Ошибки парсинга  
✅ Любые непредвиденные ошибки  

### Компоненты (вручную)

✅ **401** - Unauthorized (неверные данные)  
✅ **403** - Forbidden (нет прав)  
✅ **404** - Not Found (ресурс не найден)  
✅ **409** - Conflict (конфликт данных)  
✅ **422** - Validation Error (ошибки валидации)  
✅ **429** - Too Many Requests (rate limit)  

## Примеры использования

### Пример 1: Простой случай

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Вход выполнен!');
  } catch (error: any) {
    // Обрабатываем только 401
    if (error?.status === 401) {
      toast.error('Неверные данные');
    }
    // 500+, network errors - обработаны middleware
  }
};
```

### Пример 2: Детальная обработка

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Добро пожаловать!');
    navigate('/dashboard');
  } catch (error: any) {
    switch (error?.status) {
      case 401:
        toast.error('Неверный email или пароль');
        break;
      case 403:
        toast.error('Ваш аккаунт заблокирован');
        setShowContactSupport(true);
        break;
      case 429:
        toast.error('Слишком много попыток. Подождите 5 минут');
        setRetryAfter(Date.now() + 5 * 60 * 1000);
        break;
      // Остальные ошибки обработаны middleware
    }
  }
};
```

### Пример 3: Без дополнительной обработки

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Вход выполнен!');
  } catch (error) {
    // Все ошибки обработаны middleware
    // Ничего не делаем
  }
};
```

### Пример 4: С кастомным UI

```typescript
const [errorMessage, setErrorMessage] = useState('');

const handleLogin = async () => {
  try {
    await login(email, password);
    setErrorMessage('');
    navigate('/dashboard');
  } catch (error: any) {
    // Показываем ошибку в UI вместо toast
    if (error?.status === 401) {
      setErrorMessage('Неверный email или пароль');
    } else if (error?.status === 429) {
      setErrorMessage('Слишком много попыток');
    }
    // Остальные ошибки показаны middleware через toast
  }
};

return (
  <div>
    {errorMessage && <ErrorBanner message={errorMessage} />}
    <button onClick={handleLogin}>Login</button>
  </div>
);
```

## Интеграция с системами мониторинга

Middleware можно расширить для отправки ошибок в Sentry, LogRocket, etc:

```typescript
export const rtkQueryErrorLogger: Middleware =
  (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const error = action.payload;
      
      // Отправляем в Sentry
      if (error && 'status' in error && error.status >= 500) {
        Sentry.captureException(new Error(`API Error ${error.status}`), {
          extra: {
            endpoint: action.meta?.arg?.endpointName,
            status: error.status,
            data: error.data,
          },
        });
      }
      
      // Показываем пользователю
      if (error.status >= 500) {
        toast.error('Сервер временно недоступен');
      }
    }
    
    return next(action);
  };
```

## Преимущества подхода

✅ **Автоматическая обработка** - непредвиденные ошибки ловятся автоматически  
✅ **Гибкость** - ожидаемые ошибки обрабатываются по-разному  
✅ **Чистый код** - не нужно try-catch для каждой ошибки  
✅ **Мониторинг** - легко интегрировать с Sentry/LogRocket  
✅ **Консистентность** - одинаковая обработка критических ошибок  

## Итог

**Двухуровневая стратегия:**
1. Middleware - ловит непредвиденные ошибки (500+, network)
2. Компоненты - обрабатывают ожидаемые ошибки (401, 403, 404)

**Результат:**
- Пользователь всегда видит понятное сообщение
- Критические ошибки не остаются незамеченными
- Код остаётся чистым и гибким

Это **правильный и рекомендуемый подход**! ⭐
