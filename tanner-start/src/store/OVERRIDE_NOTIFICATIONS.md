# Переопределение глобальных уведомлений

## Проблема

Глобальные уведомления удобны, но иногда нужно:
- Показать кастомное сообщение
- Добавить дополнительную логику
- Обработать ошибку по-особенному
- Вообще не показывать уведомления

## Решение - Флаг silent

Используйте параметр `silent` чтобы отключить глобальные уведомления:

```typescript
// Отключаем глобальные уведомления
await login(email, password, { silent: true });

// Показываем кастомное сообщение
notify.success('🎉 Мое кастомное сообщение!');
```

## Примеры использования

### 1. Кастомное сообщение успеха

```typescript
const handleLogin = async () => {
  try {
    await login(email, password, { silent: true });
    // Кастомное сообщение
    notify.success('🎉 Вы успешно вошли в систему!');
    navigate('/dashboard');
  } catch (error) {
    notify.error('😢 Не удалось войти');
  }
};
```

### 2. С глобальным + дополнительная логика

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    // Глобальный toast уже показан ✅
    // Добавляем свою логику
    navigate('/dashboard');
    analytics.track('user_logged_in');
  } catch (error) {
    // Глобальный toast уже показан ✅
    console.error('Login failed');
  }
};
```

### 3. Детальная обработка ошибок

```typescript
const handleLogin = async () => {
  try {
    await login(email, password, { silent: true });
    notify.success('✅ Вход выполнен!');
  } catch (error: any) {
    // Разные сообщения для разных ошибок
    switch (error?.status) {
      case 401:
        notify.error('🔒 Неверный email или пароль');
        break;
      case 403:
        notify.error('⛔ Ваш аккаунт заблокирован');
        break;
      case 429:
        notify.error('⏰ Слишком много попыток. Подождите 5 минут');
        break;
      case 500:
        notify.error('🔧 Проблемы на сервере. Попробуйте позже');
        break;
      default:
        notify.error('❌ Произошла ошибка');
    }
  }
};
```

### 4. Условное переопределение

```typescript
const handleLogin = async () => {
  const isAdmin = email.includes('admin');
  
  try {
    // Отключаем глобальные уведомления только для админа
    await login(email, password, { silent: isAdmin });
    
    if (isAdmin) {
      // Кастомное сообщение для админа
      notify.success('🔐 Добро пожаловать, администратор!');
      navigate('/admin');
    } else {
      // Для обычных пользователей - глобальное сообщение
      navigate('/dashboard');
    }
  } catch (error) {
    if (isAdmin) {
      notify.error('❌ Ошибка входа администратора');
    }
    // Для обычных пользователей - глобальное сообщение
  }
};
```

### 5. Без уведомлений вообще

```typescript
const handleLoginSilent = async () => {
  try {
    await login(email, password, { silent: true });
    // Никаких уведомлений
    console.log('Logged in silently');
  } catch (error) {
    // Никаких уведомлений
    console.error('Login failed silently');
  }
};
```

### 6. С кастомным UI вместо toast

```typescript
const [errorMessage, setErrorMessage] = useState('');

const handleLogin = async () => {
  try {
    await login(email, password, { silent: true });
    setErrorMessage('');
    // Показываем кастомный UI
    setShowSuccessModal(true);
  } catch (error: any) {
    // Показываем ошибку в UI вместо toast
    setErrorMessage(error?.data?.message || 'Ошибка входа');
  }
};

return (
  <div>
    {errorMessage && (
      <div className="error-banner">{errorMessage}</div>
    )}
    <button onClick={handleLogin}>Login</button>
  </div>
);
```

### 7. С прогресс-баром

```typescript
const handleLogin = async () => {
  try {
    await login(email, password, { silent: true });
    // Кастомный прогресс
    toast.promise(
      Promise.resolve(),
      {
        loading: 'Входим...',
        success: '✅ Вход выполнен!',
        error: '❌ Ошибка входа',
      }
    );
  } catch (error) {
    // Обработано в toast.promise
  }
};
```

## Реализация

### 1. В API добавьте поддержку silent

`src/store/api/authApi.ts`:

```typescript
export interface LoginRequest {
  email: string;
  password: string;
  silent?: boolean; // Отключить глобальные уведомления
}

login: build.mutation<LoginResponse, LoginRequest>({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
      
      // Показываем уведомление только если не silent
      if (!arg.silent) {
        notify.success(`Добро пожаловать, ${data.user.name}!`);
      }
    } catch (error) {
      // Показываем ошибку только если не silent
      if (!arg.silent) {
        notify.error(getErrorMessage(error));
      }
      // Пробрасываем ошибку для локальной обработки
      throw error;
    }
  },
}),
```

### 2. В хуке добавьте параметр options

`src/store/hooks/useAuthRTK.ts`:

```typescript
const login = useCallback(
  async (email: string, password: string, options?: { silent?: boolean }) => {
    const request: any = { email, password };
    if (options?.silent !== undefined) {
      request.silent = options.silent;
    }
    return await loginMutation(request).unwrap();
  },
  [loginMutation]
);
```

### 3. Используйте в компонентах

```typescript
// Стандартное использование (с глобальными уведомлениями)
await login(email, password);

// С отключенными глобальными уведомлениями
await login(email, password, { silent: true });
```

## Когда использовать что?

### Используйте глобальные уведомления (без silent)

✅ Стандартные операции  
✅ Одинаковые сообщения везде  
✅ Простые случаи  

```typescript
await login(email, password);
// Просто и работает!
```

### Используйте silent + кастомные уведомления

✅ Специфичные сообщения  
✅ Разные сообщения для разных ошибок  
✅ Кастомный UI вместо toast  
✅ Дополнительная логика  

```typescript
try {
  await login(email, password, { silent: true });
  notify.success('Мое сообщение!');
} catch (error) {
  notify.error('Моя ошибка!');
}
```

### Используйте комбинированный подход

✅ Глобальные уведомления + дополнительная логика  

```typescript
try {
  await login(email, password);
  // Глобальный toast показан
  navigate('/dashboard');
} catch (error) {
  // Глобальный toast показан
  console.error('Failed');
}
```

## Примеры компонентов

Смотрите полный пример в:
- `src/components/examples/AuthCustomNotifications.tsx`

## Итог

Флаг `silent` даёт полный контроль над уведомлениями:
- Можно отключить глобальные
- Можно показать кастомные
- Можно комбинировать
- Гибко и просто

Используйте то, что подходит вашему случаю! 🎯
