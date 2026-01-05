# ✅ Реализована обработка ошибок RTK Query

## 📦 Что создано

### Основные файлы:

1. **src/shared/api/base-api.ts** - базовая конфигурация RTK Query API
2. **src/shared/store/index.ts** - Redux store с подключенным middleware
3. **src/shared/middleware/rtk-query-error-logger.ts** - глобальная обработка ошибок
4. **src/shared/utils/handle-rtk-error.tsx** - утилиты для работы с ошибками
5. **src/shared/store/hooks.ts** - типизированные хуки Redux

### Примеры использования:

6. **src/shared/api/users-api.ts** - пример API эндпоинтов
7. **src/components/UsersList.example.tsx** - пример компонента со списком
8. **src/components/UserProfile.example.tsx** - пример детальной страницы

### Конфигурация:

9. **src/main.tsx** - обновлен (добавлен Redux Provider)
10. **src/vite-env.d.ts** - типы для переменных окружения
11. **.env.example** - пример конфигурации

### Документация:

12. **ERRORS_HANDLING_GUIDE.md** - полное руководство
13. **QUICK_START_RU.md** - быстрый старт на русском
14. **src/shared/api/README.md** - документация API

## 🎯 Как работает обработка ошибок

### Middleware (автоматически):
```
401 → Редирект на /login + очистка токена
500+ → Логирование серверных ошибок
FETCH_ERROR → Логирование сетевых ошибок
```

### В компонентах (вручную):
```
403 → Нет доступа
404 → Не найдено
422 → Ошибка валидации
```

## 🚀 Начало работы

### 1. Создайте API:
```typescript
// src/shared/api/my-api.ts
import { baseApi } from './base-api'

export const myApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getData: build.query<Data[], void>({
      query: () => '/data',
    }),
  }),
})

export const { useGetDataQuery } = myApi
```

### 2. Используйте в компоненте:
```typescript
import { useGetDataQuery } from '@/shared/api/my-api'
import { handleRtkError } from '@/shared/utils/handle-rtk-error'

function MyComponent() {
  const { data, error, isLoading } = useGetDataQuery()

  if (error) {
    return handleRtkError(error, {
      403: () => <div>Нет доступа</div>,
      404: () => <div>Не найдено</div>,
      default: () => <div>Ошибка</div>,
    })
  }

  return <div>{/* контент */}</div>
}
```

## ⚙️ Настройка

### API URL:
Создайте `.env`:
```
VITE_API_URL=https://api.example.com
```

### Toast уведомления:
```bash
pnpm add sonner
```

Раскомментируйте в `src/shared/middleware/rtk-query-error-logger.ts`

## 📚 Документация

### Обработка ошибок:
- **Полное руководство**: `ERRORS_HANDLING_GUIDE.md`
- **Быстрый старт**: `QUICK_START_RU.md`
- **Утилиты**: `ERROR_UTILITIES_GUIDE.md` ⭐ NEW!
- **Шпаргалка**: `ERROR_UTILITIES_CHEATSHEET.md` ⭐ NEW!
- **Схема обработки**: `ERROR_FLOW_DIAGRAM.md`
- **API документация**: `src/shared/api/README.md`

### RPC API (единый POST endpoint):
- **Полное руководство**: `RPC_API_GUIDE.md`
- **Быстрый старт**: `RPC_QUICK_START.md`
- **Схема работы**: `RPC_FLOW_DIAGRAM.md`

### Примеры кода:
- **11 примеров утилит**: `src/components/ErrorHandling.examples.tsx` ⭐ NEW!

## ✨ Особенности

- ✅ Двухуровневая обработка ошибок
- ✅ Автоматический редирект при 401
- ✅ Типизация TypeScript
- ✅ Готовые утилиты
- ✅ Примеры использования
- ✅ Полная документация

## 🔗 Полезные ссылки

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Error Handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling)
