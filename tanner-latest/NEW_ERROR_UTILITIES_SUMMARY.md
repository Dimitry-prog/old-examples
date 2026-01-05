# ✨ Новые утилиты для обработки ошибок

## 🎉 Что добавлено

Созданы мощные утилиты, которые делают обработку ошибок **в 10 раз проще**!

## 🚀 Самый быстрый способ (1 строка!)

### Было:
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

### Стало:
```typescript
if (error) return handleCommonErrors(error)
```

**Результат:** Код сократился с 8 строк до 1! 🎯

## 📦 Новые утилиты

### 1. `handleCommonErrors` - Автоматическая обработка

```typescript
// Готовые сообщения для всех типичных ошибок
if (error) return handleCommonErrors(error)

// Или с кастомными сообщениями
if (error) {
  return handleCommonErrors(error, {
    403: 'Доступ запрещен',
    404: 'Не найдено',
  })
}
```

### 2. `useErrorHandler` - Хук (рекомендуется!)

```typescript
const errorHandler = useErrorHandler(error)

// Проверки
if (errorHandler.is(403)) { ... }
if (errorHandler.isIn([403, 404])) { ... }

// Информация
console.log(errorHandler.status)    // 403
console.log(errorHandler.message)   // "Access denied"

// Рендеринг
if (errorHandler.hasError) {
  return errorHandler.render({
    403: () => <AccessDenied />,
    404: () => <NotFound />,
  })
}
```

### 3. `handleRtkError` - Улучшенная версия

Теперь поддерживает **любые HTTP статусы**:

```typescript
handleRtkError(error, {
  400: () => <div>Неверный запрос</div>,
  401: () => <div>Требуется авторизация</div>,
  403: () => <div>Нет доступа</div>,
  404: () => <div>Не найдено</div>,
  422: () => <div>Ошибка валидации</div>,
  500: () => <div>Ошибка сервера</div>,
  503: () => <div>Сервис недоступен</div>,
  default: () => <div>Ошибка</div>,
})
```

### 4. Вспомогательные функции

```typescript
// Проверка статуса
isErrorStatus(error, 403)           // true/false
isErrorStatusIn(error, [403, 404])  // true/false

// Получение информации
getErrorMessage(error)              // "Access denied"
getErrorStatus(error)               // 403
```

## 🎯 Примеры использования

### Минимальный (1 строка)
```typescript
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return handleCommonErrors(error)

  return <div>{data?.map(user => <div>{user.name}</div>)}</div>
}
```

### Рекомендуемый (useErrorHandler)
```typescript
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  if (errorHandler.hasError) {
    return errorHandler.render({
      403: () => <AccessDenied />,
      404: () => <NotFound />,
      default: () => <div>Ошибка: {errorHandler.message}</div>,
    })
  }

  return <div>{data?.map(user => <div>{user.name}</div>)}</div>
}
```

### Продвинутый (с проверками)
```typescript
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  // Специальная обработка для 403
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

  return <div>{data?.map(user => <div>{user.name}</div>)}</div>
}
```

## 📊 Сравнение

| Подход | Строк кода | Гибкость | Удобство |
|--------|-----------|----------|----------|
| Без утилит | 8-15 | ⭐⭐⭐ | ⭐ |
| `handleRtkError` | 5-10 | ⭐⭐⭐ | ⭐⭐⭐ |
| `handleCommonErrors` | 1 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| `useErrorHandler` | 3-8 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 📁 Созданные файлы

### Основные:
1. **src/shared/utils/handle-rtk-error.tsx** - обновлен с новыми утилитами

### Документация:
2. **ERROR_UTILITIES_GUIDE.md** - полное руководство
3. **ERROR_UTILITIES_CHEATSHEET.md** - шпаргалка

### Примеры:
4. **src/components/ErrorHandling.examples.tsx** - 11 готовых примеров

## 🎓 Обучение

### Шаг 1: Прочитайте шпаргалку
📄 `ERROR_UTILITIES_CHEATSHEET.md` - 5 минут

### Шаг 2: Посмотрите примеры
📄 `src/components/ErrorHandling.examples.tsx` - 11 примеров

### Шаг 3: Используйте в своем коде
Начните с `handleCommonErrors(error)` - это самый простой способ!

### Шаг 4: Изучите продвинутые возможности
📄 `ERROR_UTILITIES_GUIDE.md` - полное руководство

## ✨ Преимущества

✅ **Меньше кода** - в 5-10 раз меньше строк  
✅ **Проще читать** - декларативный подход  
✅ **Меньше ошибок** - типизация TypeScript  
✅ **Переиспользование** - создавайте компоненты ошибок  
✅ **Гибкость** - от 1 строки до полного контроля  
✅ **Готовые сообщения** - для типичных ошибок  

## 🚀 Начните прямо сейчас!

### Вариант 1: Самый быстрый
```typescript
if (error) return handleCommonErrors(error)
```

### Вариант 2: Рекомендуемый
```typescript
const errorHandler = useErrorHandler(error)
if (errorHandler.hasError) {
  return errorHandler.renderCommon()
}
```

### Вариант 3: С кастомизацией
```typescript
const errorHandler = useErrorHandler(error)
if (errorHandler.hasError) {
  return errorHandler.render({
    403: () => <YourComponent />,
    404: () => <YourComponent />,
  })
}
```

## 📚 Документация

- **Шпаргалка**: `ERROR_UTILITIES_CHEATSHEET.md` ⭐ Начните здесь!
- **Полное руководство**: `ERROR_UTILITIES_GUIDE.md`
- **11 примеров**: `src/components/ErrorHandling.examples.tsx`
- **Общая документация**: `ERRORS_HANDLING_GUIDE.md`

## 💡 Совет

Начните с `handleCommonErrors(error)` - это займет 1 строку и покроет 90% случаев!

Когда понадобится больше контроля, переходите на `useErrorHandler`.

---

**Вопросы?** Смотрите примеры в `src/components/ErrorHandling.examples.tsx`!
