# TanStack Query - Глобальная обработка ошибок

## Реализация

### 1. Глобальная обработка в QueryClient

`src/lib/queryClient.ts`:

```typescript
import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

/**
 * Глобальная обработка ошибок для непредвиденных случаев
 */
function handleGlobalQueryError(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    
    // Серверные ошибки (500+)
    if (typeof status === 'number' && status >= 500) {
      console.error('🚨 Server Error:', error);
      toast.error(`Сервер временно недоступен (${status})`);
      return;
    }
    
    // Сетевые ошибки
    if (status === 'FETCH_ERROR' || status === 'NetworkError') {
      console.error('🚨 Network Error:', error);
      toast.error('Проверьте подключение к интернету');
      return;
    }
  }
  
  console.error('🚨 Unknown Error:', error);
}

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      // Не повторять для 4xx ошибок
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    // Глобальная обработка ошибок
    onError: (error) => {
      handleGlobalQueryError(error);
    },
  },
  mutations: {
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 1;
    },
    // Глобальная обработка ошибок
    onError: (error) => {
      handleGlobalQueryError(error);
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
```

### 2. Использование в компонентах

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function MyComponent() {
  // Query - глобальная обработка ошибок работает автоматически
  const { data, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Mutation - глобальная обработка ошибок работает автоматически
  const mutation = useMutation({
    mutationFn: createUser,
  });

  const handleCreate = async () => {
    try {
      await mutation.mutateAsync(userData);
      toast.success('Пользователь создан!');
    } catch (error: any) {
      // Обрабатываем только ожидаемые ошибки
      if (error?.status === 409) {
        toast.error('Пользователь уже существует');
      }
      // Остальные ошибки (500+, network) обработаны глобально
    }
  };

  return <div>...</div>;
}
```

## Стратегия обработки ошибок

### Глобально (автоматически)

✅ **500-599** - Серверные ошибки  
✅ **FETCH_ERROR** - Сетевые ошибки  
✅ **NetworkError** - Проблемы с сетью  
✅ Любые непредвиденные ошибки  

### Локально (в компонентах)

✅ **401** - Unauthorized  
✅ **403** - Forbidden  
✅ **404** - Not Found  
✅ **409** - Conflict  
✅ **422** - Validation Error  
✅ **429** - Too Many Requests  

## Примеры использования

### Пример 1: Query с автоматической обработкой

```typescript
function UsersList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  
  // Ошибки 500+ обработаны глобально
  // Показываем только специфичные ошибки
  if (error) {
    if ('status' in error && error.status === 404) {
      return <div>Пользователи не найдены</div>;
    }
    // Остальные ошибки показаны глобально
    return null;
  }

  return <div>{data.map(user => ...)}</div>;
}
```

### Пример 2: Mutation с локальной обработкой

```typescript
function CreateUserForm() {
  const mutation = useMutation({
    mutationFn: createUser,
  });

  const handleSubmit = async (data) => {
    try {
      await mutation.mutateAsync(data);
      toast.success('Пользователь создан!');
      navigate('/users');
    } catch (error: any) {
      // Обрабатываем только ожидаемые ошибки
      switch (error?.status) {
        case 409:
          toast.error('Email уже используется');
          break;
        case 422:
          toast.error('Проверьте введённые данные');
          break;
        // 500+, network - обработаны глобально
      }
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Пример 3: Переопределение глобальной обработки

```typescript
function SpecialComponent() {
  const { data } = useQuery({
    queryKey: ['special'],
    queryFn: fetchSpecial,
    // Переопределяем глобальную обработку
    onError: (error) => {
      // Кастомная обработка для этого запроса
      console.log('Special error:', error);
      showCustomErrorModal(error);
    },
  });

  return <div>...</div>;
}
```

### Пример 4: Без дополнительной обработки

```typescript
function SimpleComponent() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  // Все ошибки обработаны глобально
  // Ничего не делаем
  return <div>{data}</div>;
}
```

## Интеграция с toast библиотекой

Обновите `handleGlobalQueryError` для использования вашей toast библиотеки:

```typescript
import toast from 'react-hot-toast';

function handleGlobalQueryError(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    
    if (typeof status === 'number' && status >= 500) {
      toast.error(`Сервер временно недоступен (${status})`);
      return;
    }
    
    if (status === 'FETCH_ERROR' || status === 'NetworkError') {
      toast.error('Проверьте подключение к интернету');
      return;
    }
  }
  
  toast.error('Произошла непредвиденная ошибка');
}
```

## Интеграция с системами мониторинга

```typescript
import * as Sentry from '@sentry/react';

function handleGlobalQueryError(error: unknown) {
  // Отправляем в Sentry
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    
    if (typeof status === 'number' && status >= 500) {
      Sentry.captureException(error, {
        tags: {
          type: 'tanstack-query',
          status,
        },
      });
      
      toast.error(`Сервер временно недоступен (${status})`);
    }
  }
}
```

## Преимущества

✅ **Автоматическая защита** - непредвиденные ошибки не остаются незамеченными  
✅ **Чистый код** - не нужно обрабатывать каждую ошибку вручную  
✅ **Гибкость** - можно переопределить для конкретных запросов  
✅ **Консистентность** - одинаковая обработка критических ошибок  
✅ **Мониторинг** - легко интегрировать с Sentry/LogRocket  

## Итог

TanStack Query предоставляет встроенную глобальную обработку ошибок через `defaultOptions.queries.onError` и `defaultOptions.mutations.onError`.

Это правильный и рекомендуемый подход! ⭐
