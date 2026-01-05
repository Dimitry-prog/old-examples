# Глобальная обработка ошибок в RTK Query

## Проблема

Без глобальной обработки приходится ловить ошибки в каждом компоненте:

```typescript
// ❌ Дублирование кода в каждом компоненте
const handleLogin = async () => {
  try {
    await login(email, password);
  } catch (error) {
    toast.error('Ошибка входа');  // Повторяется везде
  }
};
```

## Решение - Глобальные уведомления в onQueryStarted

Обрабатывайте ошибки один раз в API определении:

```typescript
// ✅ Обработка в одном месте
login: build.mutation({
  query: (credentials) => ({
    url: '/login',
    method: 'POST',
    body: credentials,
  }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
      notify.success(`Добро пожаловать, ${data.user.name}!`);  // ✅
    } catch (error) {
      notify.error(getErrorMessage(error));  // ✅ Глобально
    }
  },
}),
```

Теперь в компонентах просто:

```typescript
// ✅ Чисто и просто
const handleLogin = async () => {
  await login(email, password);
  // Toast показывается автоматически!
};
```

## Реализация

### 1. Система уведомлений

`src/store/api/notifications.ts`:

```typescript
type ToastType = 'success' | 'error' | 'info' | 'warning';

class NotificationService {
  private toastFn: ((message: string, type: ToastType) => void) | null = null;

  init(toastFunction: (message: string, type: ToastType) => void) {
    this.toastFn = toastFunction;
  }

  success(message: string) {
    if (this.toastFn) {
      this.toastFn(message, 'success');
    } else {
      console.log('✅', message);
    }
  }

  error(message: string) {
    if (this.toastFn) {
      this.toastFn(message, 'error');
    } else {
      console.error('❌', message);
    }
  }
}

export const notify = new NotificationService();

export function getErrorMessage(error: any): string {
  if (error?.data?.message) return error.data.message;
  if (error?.message) return error.message;
  if (error?.status) return `Ошибка ${error.status}`;
  return 'Произошла ошибка';
}
```

### 2. Инициализация с вашей toast библиотекой

`src/main.tsx`:

```typescript
import { notify } from './store/api/notifications';
import toast from 'react-hot-toast';  // или sonner, или другая

// Инициализируем перед рендером
notify.init((message, type) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast(message);
      break;
    case 'warning':
      toast(message, { icon: '⚠️' });
      break;
  }
});

// Затем рендерим приложение
root.render(<App />);
```

### 3. Использование в API

`src/store/api/authApi.ts`:

```typescript
import { notify, getErrorMessage } from './notifications';

export const authApi = createApi({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          notify.success(`Добро пожаловать, ${data.user.name}!`);
        } catch (error) {
          notify.error(getErrorMessage(error));
        }
      },
    }),

    logout: build.mutation({
      query: () => ({ url: '/logout', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearUser());
          notify.info('Вы вышли из системы');
        } catch (error) {
          dispatch(clearUser());
          notify.error(getErrorMessage(error));
        }
      },
    }),

    updateProfile: build.mutation({
      query: (body) => ({ url: '/profile', method: 'PATCH', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
          notify.success('Профиль обновлён');
        } catch (error) {
          notify.error(getErrorMessage(error));
        }
      },
    }),
  }),
});
```

## Примеры интеграции с популярными библиотеками

### React Hot Toast

```typescript
import toast from 'react-hot-toast';
import { notify } from './store/api/notifications';

notify.init((message, type) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast(message);
      break;
    case 'warning':
      toast(message, { icon: '⚠️' });
      break;
  }
});
```

### Sonner

```typescript
import { toast } from 'sonner';
import { notify } from './store/api/notifications';

notify.init((message, type) => {
  toast[type](message);
});
```

### Ant Design

```typescript
import { message } from 'antd';
import { notify } from './store/api/notifications';

notify.init((msg, type) => {
  message[type](msg);
});
```

### Chakra UI

```typescript
import { useToast } from '@chakra-ui/react';
import { notify } from './store/api/notifications';

// В корневом компоненте
function App() {
  const toast = useToast();

  useEffect(() => {
    notify.init((message, type) => {
      toast({
        title: message,
        status: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
      });
    });
  }, [toast]);

  return <YourApp />;
}
```

## Кастомизация сообщений

### По типу ошибки

```typescript
export function getErrorMessage(error: any): string {
  // HTTP статусы
  if (error?.status === 401) {
    return 'Неверный email или пароль';
  }
  if (error?.status === 403) {
    return 'Доступ запрещён';
  }
  if (error?.status === 404) {
    return 'Ресурс не найден';
  }
  if (error?.status === 429) {
    return 'Слишком много запросов. Попробуйте позже';
  }
  if (error?.status === 500) {
    return 'Ошибка сервера. Попробуйте позже';
  }

  // Сообщение от сервера
  if (error?.data?.message) {
    return error.data.message;
  }

  // Сетевые ошибки
  if (error?.error === 'NetworkError') {
    return 'Проблемы с подключением к интернету';
  }

  return 'Произошла ошибка';
}
```

### Разные сообщения для разных endpoints

```typescript
login: build.mutation({
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
      notify.success(`Добро пожаловать, ${data.user.name}!`);
    } catch (error) {
      // Кастомное сообщение для логина
      if (error?.status === 401) {
        notify.error('Неверный email или пароль');
      } else if (error?.status === 429) {
        notify.error('Слишком много попыток входа. Попробуйте через 5 минут');
      } else {
        notify.error(getErrorMessage(error));
      }
    }
  },
}),
```

## Переопределение глобальных уведомлений

### Способ 1: Флаг silent (рекомендуется) ⭐

```typescript
// В API добавьте поддержку silent
interface LoginRequest {
  email: string;
  password: string;
  silent?: boolean;  // Отключить глобальные уведомления
}

login: build.mutation({
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(setUser(data.user));
      if (!arg.silent) {
        notify.success(`Добро пожаловать, ${data.user.name}!`);
      }
    } catch (error) {
      if (!arg.silent) {
        notify.error(getErrorMessage(error));
      }
      throw error; // Пробрасываем для локальной обработки
    }
  },
}),

// В хуке
const login = async (email, password, options?: { silent?: boolean }) => {
  return await loginMutation({ 
    email, 
    password, 
    silent: options?.silent 
  }).unwrap();
};

// Использование в компоненте
const handleLogin = async () => {
  try {
    // Отключаем глобальные уведомления
    await login(email, password, { silent: true });
    // Показываем кастомное сообщение
    notify.success('🎉 Вы успешно вошли!');
  } catch (error) {
    // Кастомная обработка ошибки
    notify.error('😢 Не удалось войти');
  }
};
```

### Способ 2: try-catch с дополнительной логикой

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    // Глобальный toast уже показан ✅
    // Добавляем дополнительную логику
    navigate('/dashboard');
    analytics.track('user_logged_in');
  } catch (error) {
    // Глобальный toast уже показан ✅
    // Добавляем дополнительную логику
    console.error('Login failed');
  }
};
```

### Способ 3: Условное переопределение

```typescript
const handleLogin = async () => {
  const isAdmin = email.includes('admin');
  
  try {
    // Отключаем глобальные уведомления для админа
    await login(email, password, { silent: isAdmin });
    
    if (isAdmin) {
      // Кастомное сообщение для админа
      notify.success('🔐 Добро пожаловать, администратор!');
    }
    // Для обычных пользователей - глобальное сообщение
  } catch (error) {
    if (isAdmin) {
      notify.error('❌ Ошибка входа администратора');
    }
    // Для обычных пользователей - глобальное сообщение
  }
};
```

### Способ 4: Детальная обработка ошибок

```typescript
const handleLogin = async () => {
  try {
    await login(email, password, { silent: true });
    notify.success('✅ Вход выполнен!');
  } catch (error: any) {
    // Детальная обработка разных ошибок
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
        notify.error('🔧 Проблемы на сервере');
        break;
      default:
        notify.error(getErrorMessage(error));
    }
  }
};
```

### Способ 5: Без уведомлений вообще

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

## Преимущества

✅ **Централизация** - вся логика уведомлений в одном месте  
✅ **Меньше кода** - не нужно try-catch в каждом компоненте  
✅ **Консистентность** - одинаковые сообщения везде  
✅ **Легко менять** - изменения в одном месте  
✅ **Гибкость** - можно переопределить при необходимости  
✅ **Тестируемость** - легко тестировать отдельно  

## Когда использовать

✅ **Используйте глобальную обработку когда:**
- Стандартные CRUD операции
- Одинаковые сообщения везде
- Хотите меньше boilerplate
- Нужна консистентность

❌ **Используйте локальную обработку когда:**
- Нужны специфичные сообщения
- Сложная логика обработки ошибок
- Разное поведение в разных местах
- Нужен полный контроль

## Итог

Глобальная обработка ошибок через `onQueryStarted` + система уведомлений:
- Упрощает код
- Обеспечивает консистентность
- Легко поддерживать
- Гибко настраивается

Это **рекомендуемый подход** для большинства случаев! ⭐
