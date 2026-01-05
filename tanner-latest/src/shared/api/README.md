# Обработка ошибок в RTK Query

## Архитектура

Система обработки ошибок разделена на два уровня:

### 1. Глобальный уровень (Middleware)

**Файл:** `src/shared/middleware/rtk-query-error-logger.ts`

Обрабатывает:
- **401 (Unauthorized)** - автоматически очищает токен и перенаправляет на `/login`
- **500+** - серверные ошибки, логирует в консоль
- **FETCH_ERROR, PARSING_ERROR** - неожиданные ошибки (проблемы с сетью, парсингом)

### 2. Уровень компонентов

Обрабатывает специфичные бизнес-ошибки:
- **403** - нет доступа
- **404** - ресурс не найден
- **422** - ошибки валидации
- Другие 4xx статусы

## Использование

### Базовая настройка

1. Store уже настроен в `src/shared/store/index.ts`
2. Middleware подключен автоматически
3. Provider добавлен в `src/main.tsx`

### Создание API эндпоинтов

```typescript
// src/shared/api/my-api.ts
import { baseApi } from './base-api'

export const myApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getData: build.query<DataType, void>({
      query: () => '/data',
    }),
  }),
})

export const { useGetDataQuery } = myApi
```

### Обработка ошибок в компонентах

#### Вариант 1: Ручная обработка

```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (error && 'status' in error) {
    if (error.status === 403) {
      return <div>Нет доступа</div>
    }
    if (error.status === 404) {
      return <div>Не найдено</div>
    }
  }

  return <div>{/* контент */}</div>
}
```

#### Вариант 2: С утилитой handleRtkError

```typescript
import { handleRtkError } from '@/shared/utils/handle-rtk-error'

function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (error) {
    return handleRtkError(error, {
      403: () => <div>Нет доступа</div>,
      404: () => <div>Не найдено</div>,
      default: () => <div>Произошла ошибка</div>,
    })
  }

  return <div>{/* контент */}</div>
}
```

### Обработка ошибок мутаций

```typescript
function MyComponent() {
  const [createItem] = useCreateItemMutation()

  const handleCreate = async () => {
    try {
      await createItem(data).unwrap()
      // Успех
    } catch (error) {
      if (error && 'status' in error) {
        if (error.status === 403) {
          // Обработка 403
        } else if (error.status === 422) {
          // Обработка валидации
        }
        // 401 и 500+ обработаны в middleware
      }
    }
  }

  return <button onClick={handleCreate}>Создать</button>
}
```

## Утилиты

### handleRtkError

Помогает обрабатывать ошибки декларативно:

```typescript
handleRtkError(error, {
  403: () => <AccessDenied />,
  404: () => <NotFound />,
  default: () => <GenericError />,
})
```

### getErrorMessage

Извлекает сообщение об ошибке:

```typescript
const message = getErrorMessage(error)
// "Ошибка 404" или "Неверные данные" и т.д.
```

### isFetchBaseQueryError / isSerializedError

Type guards для проверки типа ошибки:

```typescript
if (isFetchBaseQueryError(error)) {
  // error.status доступен
}
```

## Примеры

Смотрите примеры использования:
- `src/components/UsersList.example.tsx` - список с мутациями
- `src/components/UserProfile.example.tsx` - детальная страница

## Настройка

### Изменение базового URL

```typescript
// src/shared/api/base-api.ts
baseUrl: process.env.VITE_API_URL || '/api'
```

### Добавление toast уведомлений

Раскомментируйте строки с `toast` в `rtk-query-error-logger.ts` и установите библиотеку:

```bash
pnpm add react-hot-toast
# или
pnpm add sonner
```

### Изменение логики редиректа при 401

```typescript
// src/shared/middleware/rtk-query-error-logger.ts
if (status === 401) {
  // Ваша логика
  window.location.href = '/login'
}
```
