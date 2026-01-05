# 🛠️ Утилиты для обработки ошибок RTK Query

## 📚 Доступные утилиты

### 1. `handleRtkError` - Основная утилита

Обрабатывает ошибки с помощью объекта обработчиков.

```typescript
handleRtkError(error, {
  403: () => <div>Нет доступа</div>,
  404: () => <div>Не найдено</div>,
  422: () => <div>Неверные данные</div>,
  default: () => <div>Ошибка</div>,
})
```

**Особенности:**
- ✅ Поддерживает любые HTTP статусы
- ✅ Возвращает React компоненты
- ✅ Обработчик `default` для неизвестных ошибок

### 2. `handleCommonErrors` - Быстрая обработка

Автоматически обрабатывает типичные ошибки с готовыми сообщениями.

```typescript
// С дефолтными сообщениями
handleCommonErrors(error)

// С кастомными сообщениями
handleCommonErrors(error, {
  403: 'Доступ запрещен',
  404: 'Пользователи не найдены',
})
```

**Дефолтные сообщения:**
- 403: "У вас нет доступа к этому ресурсу"
- 404: "Запрашиваемый ресурс не найден"
- 422: "Неверные данные. Проверьте введенную информацию"
- 500: "Ошибка сервера. Попробуйте позже"
- 503: "Сервис временно недоступен"

### 3. `useErrorHandler` - Хук (рекомендуется!)

Самый удобный способ работы с ошибками.

```typescript
const errorHandler = useErrorHandler(error)

if (errorHandler.hasError) {
  return errorHandler.render({
    403: () => <AccessDenied />,
    404: () => <NotFound />,
  })
}
```

**API хука:**
```typescript
{
  hasError: boolean              // Есть ли ошибка
  error: Error | undefined       // Объект ошибки
  status: number | string        // HTTP статус
  message: string                // Сообщение об ошибке
  is: (status) => boolean        // Проверка статуса
  isIn: (statuses) => boolean    // Проверка нескольких статусов
  render: (handlers) => ReactNode // Рендер с обработчиками
  renderCommon: (messages) => ReactNode // Рендер с готовыми сообщениями
}
```

### 4. `isErrorStatus` - Проверка статуса

Проверяет, соответствует ли ошибка конкретному статусу.

```typescript
if (isErrorStatus(error, 403)) {
  return <div>Нет доступа</div>
}
```

### 5. `isErrorStatusIn` - Проверка нескольких статусов

Проверяет, соответствует ли ошибка одному из статусов.

```typescript
if (isErrorStatusIn(error, [403, 404])) {
  return <div>Ошибка доступа или не найдено</div>
}
```

### 6. `getErrorMessage` - Получение сообщения

Извлекает текст ошибки из объекта.

```typescript
const message = getErrorMessage(error)
// "Ошибка 403" или "Access denied"
```

### 7. `getErrorStatus` - Получение статуса

Извлекает HTTP статус из ошибки.

```typescript
const status = getErrorStatus(error)
// 403, 404, 500, и т.д.
```

## 🎯 Примеры использования

### Самый простой способ (1 строка!)

```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return handleCommonErrors(error)

  return <div>{data}</div>
}
```

### Рекомендуемый способ (useErrorHandler)

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

### С проверкой конкретного статуса

```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  // Специальная обработка для 403
  if (errorHandler.is(403)) {
    return (
      <div className="p-4 bg-red-100 rounded">
        <h3>Доступ запрещен</h3>
        <p>{errorHandler.message}</p>
        <button>Запросить доступ</button>
      </div>
    )
  }

  // Для остальных ошибок
  if (errorHandler.hasError) {
    return errorHandler.renderCommon()
  }

  return <div>{data}</div>
}
```

### С несколькими статусами

```typescript
function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (isLoading) return <div>Загрузка...</div>

  // Обработка 403 и 404 одинаково
  if (isErrorStatusIn(error, [403, 404])) {
    return (
      <div>
        <p>Ресурс недоступен</p>
        <button onClick={() => window.history.back()}>Назад</button>
      </div>
    )
  }

  if (error) return handleCommonErrors(error)

  return <div>{data}</div>
}
```

### С кастомными компонентами

```typescript
// Создаем компоненты для ошибок
const AccessDenied = ({ message }: { message: string }) => (
  <div className="p-6 bg-red-50 rounded">
    <h2 className="text-xl font-bold">Доступ запрещен</h2>
    <p>{message}</p>
    <button>Запросить доступ</button>
  </div>
)

const NotFound = () => (
  <div className="p-6 bg-yellow-50 rounded">
    <h2 className="text-xl font-bold">Не найдено</h2>
    <button onClick={() => window.history.back()}>Назад</button>
  </div>
)

function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  if (errorHandler.hasError) {
    return errorHandler.render({
      403: () => <AccessDenied message={errorHandler.message} />,
      404: () => <NotFound />,
      default: () => <div>Ошибка: {errorHandler.message}</div>,
    })
  }

  return <div>{data}</div>
}
```

## 📊 Сравнение подходов

### Без утилит (старый способ):
```typescript
if (error && 'status' in error) {
  if (error.status === 403) {
    return <div>Нет доступа</div>
  }
  if (error.status === 404) {
    return <div>Не найдено</div>
  }
  return <div>Ошибка</div>
}
```

### С handleRtkError:
```typescript
if (error) {
  return handleRtkError(error, {
    403: () => <div>Нет доступа</div>,
    404: () => <div>Не найдено</div>,
    default: () => <div>Ошибка</div>,
  })
}
```

### С handleCommonErrors (самый короткий):
```typescript
if (error) return handleCommonErrors(error)
```

### С useErrorHandler (самый удобный):
```typescript
const errorHandler = useErrorHandler(error)

if (errorHandler.hasError) {
  return errorHandler.render({
    403: () => <AccessDenied />,
    404: () => <NotFound />,
  })
}
```

## 🎨 Стилизация ошибок

### С Tailwind CSS:

```typescript
handleRtkError(error, {
  403: () => (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <h3 className="font-bold text-red-800">Доступ запрещен</h3>
      <p className="text-red-600">У вас нет прав</p>
    </div>
  ),
  404: () => (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold text-yellow-800">Не найдено</h3>
      <p className="text-yellow-600">Ресурс не существует</p>
    </div>
  ),
})
```

### С кастомными классами:

```typescript
handleRtkError(error, {
  403: () => (
    <div className="error-box error-forbidden">
      <h3>Доступ запрещен</h3>
    </div>
  ),
  404: () => (
    <div className="error-box error-not-found">
      <h3>Не найдено</h3>
    </div>
  ),
})
```

## 💡 Лучшие практики

### 1. Используйте useErrorHandler для сложных случаев

```typescript
const errorHandler = useErrorHandler(error)

// Легко проверять статусы
if (errorHandler.is(403)) { ... }

// Легко получать информацию
console.log(errorHandler.status, errorHandler.message)

// Легко рендерить
return errorHandler.render({ ... })
```

### 2. Используйте handleCommonErrors для простых случаев

```typescript
// Одна строка вместо множества if-ов
if (error) return handleCommonErrors(error)
```

### 3. Создавайте переиспользуемые компоненты ошибок

```typescript
// components/errors/AccessDenied.tsx
export const AccessDenied = () => (
  <div className="error-page">
    <h1>Доступ запрещен</h1>
    <button>Запросить доступ</button>
  </div>
)

// Используйте везде
errorHandler.render({
  403: () => <AccessDenied />,
})
```

### 4. Комбинируйте подходы

```typescript
// Специальная обработка для важных ошибок
if (errorHandler.is(403)) {
  return <ComplexAccessDeniedPage />
}

// Простая обработка для остальных
if (errorHandler.hasError) {
  return errorHandler.renderCommon()
}
```

## 📚 Полные примеры

Смотрите файл `src/components/ErrorHandling.examples.tsx` с 11 готовыми примерами!

## 🔗 Связанная документация

- **ERRORS_HANDLING_GUIDE.md** - общее руководство по обработке ошибок
- **QUICK_START_RU.md** - быстрый старт
- **ERROR_FLOW_DIAGRAM.md** - схемы обработки ошибок
