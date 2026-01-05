# 🎯 Утилиты для обработки ошибок - Быстрый старт

## ⚡ TL;DR - Самое важное

### Было (8 строк):
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

### Стало (1 строка):
```typescript
if (error) return handleCommonErrors(error)
```

## 🚀 3 способа использования

### 1️⃣ Самый быстрый (1 строка)
```typescript
import { handleCommonErrors } from '@/shared/utils/handle-rtk-error'

function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return handleCommonErrors(error)

  return <div>{data}</div>
}
```

### 2️⃣ Рекомендуемый (useErrorHandler)
```typescript
import { useErrorHandler } from '@/shared/utils/handle-rtk-error'

function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  if (errorHandler.hasError) {
    return errorHandler.render({
      403: () => <div>Нет доступа</div>,
      404: () => <div>Не найдено</div>,
      default: () => <div>Ошибка: {errorHandler.message}</div>,
    })
  }

  return <div>{data}</div>
}
```

### 3️⃣ Продвинутый (полный контроль)
```typescript
import { useErrorHandler } from '@/shared/utils/handle-rtk-error'

function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()
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

  // Для остальных ошибок
  if (errorHandler.hasError) {
    return errorHandler.renderCommon()
  }

  return <div>{data}</div>
}
```

## 📦 Доступные утилиты

| Утилита | Описание | Когда использовать |
|---------|----------|-------------------|
| `handleCommonErrors` | Автоматическая обработка с готовыми сообщениями | Самый быстрый способ |
| `useErrorHandler` | Хук с полным набором методов | Рекомендуется для большинства случаев |
| `handleRtkError` | Обработка с кастомными обработчиками | Когда нужен полный контроль |
| `isErrorStatus` | Проверка конкретного статуса | Для условной логики |
| `isErrorStatusIn` | Проверка нескольких статусов | Для группировки ошибок |
| `getErrorMessage` | Получение текста ошибки | Для логирования |
| `getErrorStatus` | Получение HTTP статуса | Для логирования |

## 🎯 Выбор утилиты

```
Нужна быстрая обработка?
  └─> handleCommonErrors(error)

Нужны кастомные компоненты?
  └─> useErrorHandler(error)
      └─> errorHandler.render({ 403: () => <Component /> })

Нужна проверка статуса?
  └─> useErrorHandler(error)
      └─> errorHandler.is(403)

Нужна информация об ошибке?
  └─> useErrorHandler(error)
      └─> errorHandler.status
      └─> errorHandler.message
```

## 📚 Документация

### Начните здесь:
- **ERROR_UTILITIES_CHEATSHEET.md** ⭐ Шпаргалка (5 минут)
- **NEW_ERROR_UTILITIES_SUMMARY.md** ⭐ Краткое резюме

### Подробнее:
- **ERROR_UTILITIES_GUIDE.md** - Полное руководство
- **src/components/ErrorHandling.examples.tsx** - 11 готовых примеров

### Общая документация:
- **ERRORS_HANDLING_GUIDE.md** - Обработка ошибок в RTK Query
- **QUICK_START_RU.md** - Быстрый старт

## 💡 Примеры

### Пример 1: Минимальный код
```typescript
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()

  if (isLoading) return <div>Загрузка...</div>
  if (error) return handleCommonErrors(error)

  return <div>{data?.map(u => <div>{u.name}</div>)}</div>
}
```

### Пример 2: С кастомными сообщениями
```typescript
function Users() {
  const { data, error, isLoading } = useGetUsersQuery()

  if (isLoading) return <div>Загрузка...</div>
  
  if (error) {
    return handleCommonErrors(error, {
      403: 'Доступ к списку пользователей запрещен',
      404: 'Пользователи не найдены',
    })
  }

  return <div>{data?.map(u => <div>{u.name}</div>)}</div>
}
```

### Пример 3: С компонентами
```typescript
const AccessDenied = () => (
  <div className="p-6 bg-red-50 rounded">
    <h2>Доступ запрещен</h2>
    <button>Запросить доступ</button>
  </div>
)

function Users() {
  const { data, error, isLoading } = useGetUsersQuery()
  const errorHandler = useErrorHandler(error)

  if (isLoading) return <div>Загрузка...</div>

  if (errorHandler.hasError) {
    return errorHandler.render({
      403: () => <AccessDenied />,
      404: () => <div>Не найдено</div>,
      default: () => <div>Ошибка: {errorHandler.message}</div>,
    })
  }

  return <div>{data?.map(u => <div>{u.name}</div>)}</div>
}
```

## ✨ Преимущества

✅ **В 5-10 раз меньше кода**  
✅ **Готовые сообщения для типичных ошибок**  
✅ **Полная типизация TypeScript**  
✅ **Гибкость - от 1 строки до полного контроля**  
✅ **Переиспользуемые компоненты**  
✅ **Легко читать и поддерживать**  

## 🎓 Обучение (15 минут)

1. **5 минут** - Прочитайте `ERROR_UTILITIES_CHEATSHEET.md`
2. **5 минут** - Посмотрите примеры в `src/components/ErrorHandling.examples.tsx`
3. **5 минут** - Попробуйте в своем коде

## 🚀 Начните прямо сейчас!

### Шаг 1: Импортируйте
```typescript
import { handleCommonErrors } from '@/shared/utils/handle-rtk-error'
```

### Шаг 2: Используйте
```typescript
if (error) return handleCommonErrors(error)
```

### Шаг 3: Готово! 🎉

---

**Вопросы?** Смотрите:
- `ERROR_UTILITIES_CHEATSHEET.md` - шпаргалка
- `src/components/ErrorHandling.examples.tsx` - 11 примеров
