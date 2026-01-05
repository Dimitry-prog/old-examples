# ⚡ Шпаргалка - Утилиты для обработки ошибок

## 🚀 Самые быстрые способы

### 1 строка - handleCommonErrors
```typescript
if (error) return handleCommonErrors(error)
```

### 3 строки - useErrorHandler
```typescript
const errorHandler = useErrorHandler(error)
if (errorHandler.hasError) {
  return errorHandler.renderCommon()
}
```

## 📋 Все утилиты

| Утилита | Использование | Когда использовать |
|---------|--------------|-------------------|
| `handleCommonErrors` | `handleCommonErrors(error)` | Самый быстрый способ |
| `useErrorHandler` | `useErrorHandler(error)` | Рекомендуется для большинства случаев |
| `handleRtkError` | `handleRtkError(error, {...})` | Когда нужен полный контроль |
| `isErrorStatus` | `isErrorStatus(error, 403)` | Проверка одного статуса |
| `isErrorStatusIn` | `isErrorStatusIn(error, [403, 404])` | Проверка нескольких статусов |
| `getErrorMessage` | `getErrorMessage(error)` | Получить текст ошибки |
| `getErrorStatus` | `getErrorStatus(error)` | Получить HTTP статус |

## 💡 Примеры

### Базовый (1 строка)
```typescript
if (error) return handleCommonErrors(error)
```

### С кастомными сообщениями
```typescript
if (error) {
  return handleCommonErrors(error, {
    403: 'Доступ запрещен',
    404: 'Не найдено',
  })
}
```

### С useErrorHandler (рекомендуется)
```typescript
const errorHandler = useErrorHandler(error)

if (errorHandler.hasError) {
  return errorHandler.render({
    403: () => <AccessDenied />,
    404: () => <NotFound />,
    default: () => <div>Ошибка: {errorHandler.message}</div>,
  })
}
```

### Проверка статуса
```typescript
const errorHandler = useErrorHandler(error)

if (errorHandler.is(403)) {
  return <AccessDenied />
}

if (errorHandler.isIn([404, 410])) {
  return <NotFound />
}
```

### С handleRtkError
```typescript
if (error) {
  return handleRtkError(error, {
    403: () => <div>Нет доступа</div>,
    404: () => <div>Не найдено</div>,
    422: () => <div>Неверные данные</div>,
    500: () => <div>Ошибка сервера</div>,
    default: () => <div>Ошибка</div>,
  })
}
```

### Комбинированный подход
```typescript
const errorHandler = useErrorHandler(error)

// Специальная обработка для 403
if (errorHandler.is(403)) {
  return <ComplexAccessDeniedPage />
}

// Простая обработка для остальных
if (errorHandler.hasError) {
  return errorHandler.renderCommon()
}
```

## 🎯 Выбор утилиты

```
Нужна простая обработка?
  └─> handleCommonErrors(error)

Нужны кастомные сообщения?
  └─> handleCommonErrors(error, { 403: '...', 404: '...' })

Нужна проверка статуса?
  └─> useErrorHandler(error)
      └─> errorHandler.is(403)
      └─> errorHandler.isIn([403, 404])

Нужен полный контроль?
  └─> handleRtkError(error, {
        403: () => <Component />,
        404: () => <Component />,
      })

Нужна вся информация об ошибке?
  └─> useErrorHandler(error)
      └─> errorHandler.status
      └─> errorHandler.message
      └─> errorHandler.error
```

## 📦 Импорты

```typescript
import {
  handleRtkError,
  handleCommonErrors,
  useErrorHandler,
  isErrorStatus,
  isErrorStatusIn,
  getErrorMessage,
  getErrorStatus,
} from '@/shared/utils/handle-rtk-error'
```

## 🎨 Шаблоны

### Шаблон 1: Минимальный
```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return handleCommonErrors(error)

  return <div>{data}</div>
}
```

### Шаблон 2: Стандартный
```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  if (errorHandler.hasError) {
    return errorHandler.render({
      403: () => <AccessDenied />,
      404: () => <NotFound />,
      default: () => <div>Ошибка: {errorHandler.message}</div>,
    })
  }

  return <div>{data}</div>
}
```

### Шаблон 3: Продвинутый
```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  // Специальная обработка для критичных ошибок
  if (errorHandler.is(403)) {
    return (
      <div className="p-6 bg-red-50 rounded">
        <h2>Доступ запрещен</h2>
        <p>{errorHandler.message}</p>
        <button>Запросить доступ</button>
      </div>
    )
  }

  // Обработка группы ошибок
  if (errorHandler.isIn([404, 410])) {
    return <NotFoundPage />
  }

  // Остальные ошибки
  if (errorHandler.hasError) {
    return errorHandler.renderCommon()
  }

  return <div>{data}</div>
}
```

## 🔥 Горячие клавиши (сниппеты)

### Для VS Code (создайте в .vscode/snippets.code-snippets):

```json
{
  "RTK Error Handler": {
    "prefix": "rtkerr",
    "body": [
      "const errorHandler = useErrorHandler(error)",
      "",
      "if (errorHandler.hasError) {",
      "  return errorHandler.render({",
      "    403: () => <div>Нет доступа</div>,",
      "    404: () => <div>Не найдено</div>,",
      "    default: () => <div>Ошибка: {errorHandler.message}</div>,",
      "  })",
      "}"
    ]
  },
  "RTK Common Errors": {
    "prefix": "rtkcommon",
    "body": [
      "if (error) return handleCommonErrors(error)"
    ]
  }
}
```

## 📚 Дополнительно

- **ERROR_UTILITIES_GUIDE.md** - полное руководство
- **src/components/ErrorHandling.examples.tsx** - 11 готовых примеров
- **ERRORS_HANDLING_GUIDE.md** - общая документация
