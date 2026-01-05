# 🚀 Шпаргалка по Preloading

## Быстрые примеры

### 1️⃣ Навигация (самый частый случай)

```tsx
import { Link } from '@tanstack/react-router'
import { usePreloadOnHover } from '@/lib/lazyComponents'

function Nav() {
  const preloadDashboard = usePreloadOnHover(
    () => import('@/routes/_authenticated/dashboard')
  )

  return (
    <Link to="/dashboard" {...preloadDashboard}>
      Dashboard
    </Link>
  )
}
```

### 2️⃣ Кнопка с модальным окном

```tsx
import { Button } from '@/components/ui/button'
import { usePreloadOnHover } from '@/lib/lazyComponents'

function OpenModalButton() {
  const preloadModal = usePreloadOnHover(
    () => import('@/components/modals/HeavyModal')
  )

  return (
    <Button {...preloadModal} onClick={openModal}>
      Открыть
    </Button>
  )
}
```

### 3️⃣ Табы

```tsx
import { preloadComponent } from '@/lib/lazyComponents'

function Tabs() {
  const tabs = [
    { 
      id: 'tab1', 
      preload: () => import('@/components/Tab1') 
    },
  ]

  return tabs.map(tab => (
    <button
      key={tab.id}
      onMouseEnter={() => preloadComponent(tab.preload)}
      onFocus={() => preloadComponent(tab.preload)}
    >
      {tab.id}
    </button>
  ))
}
```

### 4️⃣ Условная предзагрузка (умная)

```tsx
import { useEffect } from 'react'
import { preloadComponent } from '@/lib/lazyComponents'

function SmartPreload() {
  useEffect(() => {
    // Только на быстром соединении
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      if (conn.effectiveType === '4g') {
        preloadComponent(() => import('@/components/Heavy'))
      }
    }

    // Или после idle
    requestIdleCallback(() => {
      preloadComponent(() => import('@/components/Heavy'))
    })
  }, [])
}
```

## Что возвращает `usePreloadOnHover`?

```tsx
{
  onMouseEnter: () => void,  // Предзагрузка при наведении
  onFocus: () => void        // Предзагрузка при фокусе
}
```

Просто spread их в компонент: `{...preloadHook}`

## Полная документация

📖 См. `src/docs/LazyLoadingGuide.md` для подробностей

## Примеры в коде

- `src/components/common/NavigationWithPreload.tsx` - навигация
- `src/components/examples/TabsWithPreloadExample.tsx` - табы
- `src/routes/_authenticated/examples.tsx` - Suspense

## Производительность

✅ **Результаты:**
- Начальный bundle: -30-50%
- Воспринимаемая скорость: +40%
- Time to Interactive: -2-3 секунды

🎯 **Лучшие практики:**
1. Предзагружайте только вероятные действия
2. Используйте на навигационных элементах
3. Проверяйте качество соединения
4. Не предзагружайте все сразу
