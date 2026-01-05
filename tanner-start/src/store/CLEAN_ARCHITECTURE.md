# Чистая архитектура - Правильное разделение ответственности

## Проблема с "глобальными уведомлениями в API"

❌ **Плохо** - смешивание ответственности:

```typescript
// API НЕ ДОЛЖЕН знать про UI!
login: build.mutation({
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
      notify.success('Добро пожаловать!'); // ❌ UI логика в API!
    } catch (error) {
      notify.error('Ошибка!'); // ❌ UI логика в API!
    }
  },
}),
```

**Проблемы:**
- API знает про UI (нарушение разделения ответственности)
- Сложно переопределить поведение
- Нужны костыли типа `silent`
- Сложно тестировать
- Негибко

## Правильное решение - Разделение слоёв

### Слой 1: API (только данные)

```typescript
// src/store/api/authApi.ts
login: build.mutation({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      // Только обновление данных
      dispatch(setUser(data.user));
    } catch (error) {
      // Просто пробрасываем ошибку
      throw error;
    }
  },
}),
```

### Слой 2: Хук (бизнес-логика)

```typescript
// src/store/hooks/useAuthRTK.ts
export const useAuthRTK = () => {
  const [loginMutation, { isLoading, error }] = useLoginMutation();

  const login = useCallback(
    async (email: string, password: string) => {
      return await loginMutation({ email, password }).unwrap();
    },
    [loginMutation]
  );

  return { login, isLoading, error };
};
```

### Слой 3: Компонент (UI/UX)

```typescript
// src/components/LoginForm.tsx
function LoginForm() {
  const { login } = useAuthRTK();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // UI логика в компоненте!
      toast.success('Добро пожаловать!');
      navigate('/dashboard');
    } catch (error) {
      // UI логика в компоненте!
      toast.error('Ошибка входа');
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## Преимущества чистой архитектуры

### ✅ Гибкость

```typescript
// Разные компоненты - разные сообщения
function LoginPage() {
  const { login } = useAuthRTK();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      toast.success('🎉 Вы вошли!');
    } catch (error) {
      toast.error('😢 Ошибка входа');
    }
  };
}

function QuickLoginModal() {
  const { login } = useAuthRTK();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Другое сообщение!
      toast.success('✅ Успешно!');
      closeModal();
    } catch (error) {
      toast.error('❌ Не удалось войти');
    }
  };
}
```

### ✅ Тестируемость

```typescript
// Легко тестировать API
test('login updates user in store', async () => {
  const result = await store.dispatch(authApi.endpoints.login.initiate({
    email: 'test@test.com',
    password: 'password'
  }));
  
  expect(store.getState().auth.user).toBeDefined();
});

// Легко тестировать компонент
test('shows success message on login', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByText('Login'));
  
  expect(screen.getByText('Добро пожаловать!')).toBeInTheDocument();
});
```

### ✅ Переиспользование

```typescript
// Один API - разные UI
function LoginPage() {
  const { login } = useAuthRTK();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      toast.success('Добро пожаловать!');
    } catch (error) {
      toast.error('Ошибка входа');
    }
  };
}

function SilentLogin() {
  const { login } = useAuthRTK();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Без уведомлений!
      console.log('Logged in silently');
    } catch (error) {
      console.error('Login failed');
    }
  };
}

function CustomUILogin() {
  const { login } = useAuthRTK();
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      setError('');
      // Кастомный UI вместо toast!
      setShowSuccessModal(true);
    } catch (error) {
      setError('Ошибка входа');
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

## Сравнение подходов

### ❌ С "глобальными уведомлениями"

```typescript
// API
login: build.mutation({
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
      if (!arg.silent) { // Костыль!
        notify.success('Добро пожаловать!');
      }
    } catch (error) {
      if (!arg.silent) { // Костыль!
        notify.error('Ошибка!');
      }
    }
  },
}),

// Компонент
const handleLogin = async () => {
  await login(email, password, { silent: true }); // Костыль!
  toast.success('Мое сообщение'); // Дублирование логики
};
```

**Проблемы:**
- Нужен флаг `silent` (костыль)
- API знает про UI
- Сложно переопределить
- Дублирование логики

### ✅ С чистой архитектурой

```typescript
// API
login: build.mutation({
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user)); // Только данные!
    } catch (error) {
      throw error; // Просто пробрасываем
    }
  },
}),

// Компонент
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Мое сообщение'); // UI логика здесь!
  } catch (error) {
    toast.error('Моя ошибка'); // UI логика здесь!
  }
};
```

**Преимущества:**
- Нет костылей
- Чистое разделение
- Легко переопределить
- Одна ответственность

## Паттерны использования

### 1. Простой случай

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Вход выполнен!');
  } catch (error) {
    toast.error('Ошибка входа');
  }
};
```

### 2. С навигацией

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Добро пожаловать!');
    navigate('/dashboard');
  } catch (error) {
    toast.error('Ошибка входа');
  }
};
```

### 3. С детальными ошибками

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success('Вход выполнен!');
  } catch (error: any) {
    switch (error?.status) {
      case 401:
        toast.error('Неверный email или пароль');
        break;
      case 429:
        toast.error('Слишком много попыток');
        break;
      default:
        toast.error('Ошибка входа');
    }
  }
};
```

### 4. С кастомным UI

```typescript
const [errorMessage, setErrorMessage] = useState('');

const handleLogin = async () => {
  try {
    await login(email, password);
    setErrorMessage('');
    setShowSuccessModal(true);
  } catch (error: any) {
    setErrorMessage(error?.data?.message || 'Ошибка входа');
  }
};

return (
  <div>
    {errorMessage && <ErrorBanner message={errorMessage} />}
    <button onClick={handleLogin}>Login</button>
  </div>
);
```

### 5. Без уведомлений

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    console.log('Logged in silently');
  } catch (error) {
    console.error('Login failed');
  }
};
```

## Когда использовать что?

### ✅ Используйте чистую архитектуру когда:

- Разные компоненты нужны разные сообщения
- Нужна гибкость
- Важна тестируемость
- Хотите чистый код
- **Всегда** (это правильный подход!)

### ❌ НЕ используйте "глобальные уведомления" когда:

- Нужна гибкость (они негибкие)
- Разные сообщения в разных местах (они одинаковые)
- Важна чистота кода (они смешивают ответственность)
- **Никогда** (это костыль!)

## Итог

**Правильная архитектура:**
- API - только данные
- Хук - бизнес-логика
- Компонент - UI/UX

**Преимущества:**
- Чистый код
- Гибкость
- Тестируемость
- Переиспользование
- Нет костылей

**Используйте чистую архитектуру!** ⭐
