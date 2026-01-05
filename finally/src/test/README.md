# Тестирование

## Установленные пакеты

- `vitest` - тестовый фреймворк
- `@testing-library/react` - утилиты для тестирования React компонентов
- `@testing-library/user-event` - симуляция действий пользователя
- `@testing-library/jest-dom` - дополнительные матчеры
- `@vitest/ui` - UI для просмотра тестов
- `@vitest/coverage-v8` - покрытие кода
- `jsdom` - DOM окружение для тестов
- `happy-dom` - альтернативное быстрое DOM окружение

## Команды

```bash
# Запустить тесты один раз
pnpm test

# Запустить тесты в watch режиме
pnpm test:watch

# Открыть UI для тестов
pnpm test:ui

# Запустить тесты с покрытием кода
pnpm test:coverage
```

## Примеры

### Тест утилиты
См. `src/shared/libs/utils/cn/cn.test.ts`

### Тест React компонента
См. `src/test/example.test.tsx`
