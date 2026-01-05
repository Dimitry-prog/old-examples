# Библиотека утилит

## lazyComponents.ts - Lazy Loading и Preloading

### Быстрый старт

#### 1. Базовый Lazy Loading

```tsx
import { Suspense } from 'react'
import { RegistrationFormExample } from '@/lib/lazyComponents'
import { Loading } from '@/components/common/Loading'

function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <RegistrationFormExample />
    </Suspense>
  )
}
```

#### 2. Предзагрузка при hover (рекомендуется для навигации)

```tsx
import { Link } from '@tanstack/react-router'
import { usePreloadOnHover } from '@/lib/lazyComponents'

function Nav() {
  const preload = usePreloadOnHover(
    () => import('@/routes/_authenticated/dashboard')
  )

  return (
    <Link to="/dashboard" {...preload}>
      Dashboard
    </Link>
  )
}
```

#### 3. Программная предзагрузка

```tsx
import { preloadComponent } from '@/lib/lazyComponents'

function Button() {
  return (
    <button
      onMouseEnter={() => 
        preloadComponent(() => import('@/components/HeavyComponent'))
      }
    >
      Открыть
    </button>
  )
}
```

### Когда использовать

✅ **Используйте preloading для:**
- Навигационных ссылок
- Модальных окон
- Табов
- Следующего шага в форме

❌ **Не используйте для:**
- Редко используемых компонентов
- На медленном соединении
- Всех компонентов сразу

### Примеры

См. полное руководство: `src/docs/LazyLoadingGuide.md`

Примеры кода:
- `src/components/common/NavigationWithPreload.tsx`
- `src/components/examples/TabsWithPreloadExample.tsx`
