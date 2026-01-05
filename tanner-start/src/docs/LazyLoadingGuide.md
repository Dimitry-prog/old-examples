# Руководство по Lazy Loading и Preloading

## Обзор

Lazy loading позволяет загружать компоненты только когда они нужны, что уменьшает размер начального bundle и ускоряет загрузку приложения.

## Базовое использование

### 1. Lazy Loading компонентов

```tsx
import { Suspense } from 'react'
import { Loading } from '@/components/common/Loading'
import { RegistrationFormExample } from '@/lib/lazyComponents'

function MyPage() {
  return (
    <Suspense fallback={<Loading message="Загрузка формы..." />}>
      <RegistrationFormExample />
    </Suspense>
  )
}
```

## Preloading - Предзагрузка компонентов

### 2. Использование `preloadComponent`

Предзагружает компонент программно, например, при определенном событии:

```tsx
import { preloadComponent } from '@/lib/lazyComponents'

function MyComponent() {
  const handleClick = () => {
    // Предзагружаем компонент перед навигацией
    preloadComponent(() => import('@/components/examples/ApiIntegrationExample'))
    
    // Затем переходим на страницу
    navigate('/examples')
  }

  return <button onClick={handleClick}>Перейти к примерам</button>
}
```

### 3. Использование `usePreloadOnHover`

Автоматически предзагружает компонент при наведении мыши или фокусе:

```tsx
import { Link } from '@tanstack/react-router'
import { usePreloadOnHover } from '@/lib/lazyComponents'

function Navigation() {
  // Получаем обработчики событий для предзагрузки
  const preloadExamples = usePreloadOnHover(
    () => import('@/components/examples/RegistrationFormExample')
  )

  return (
    <nav>
      <Link 
        to="/examples" 
        {...preloadExamples}
      >
        Примеры
      </Link>
    </nav>
  )
}
```

## Практические примеры

### Пример 1: Навигация с предзагрузкой

```tsx
import { Link } from '@tanstack/react-router'
import { usePreloadOnHover } from '@/lib/lazyComponents'

function MainMenu() {
  const preloadDashboard = usePreloadOnHover(
    () => import('@/routes/_authenticated/dashboard')
  )
  
  const preloadProfile = usePreloadOnHover(
    () => import('@/routes/_authenticated/profile')
  )

  return (
    <nav className="flex gap-4">
      <Link 
        to="/dashboard" 
        {...preloadDashboard}
        className="hover:text-primary"
      >
        Панель управления
      </Link>
      
      <Link 
        to="/profile" 
        {...preloadProfile}
        className="hover:text-primary"
      >
        Профиль
      </Link>
    </nav>
  )
}
```

### Пример 2: Кнопки с предзагрузкой

```tsx
import { Button } from '@/components/ui/button'
import { usePreloadOnHover } from '@/lib/lazyComponents'

function ActionButtons() {
  const preloadHeavyComponent = usePreloadOnHover(
    () => import('@/components/heavy/DataVisualization')
  )

  return (
    <Button 
      {...preloadHeavyComponent}
      onClick={() => {
        // Компонент уже предзагружен при hover
        showModal()
      }}
    >
      Открыть визуализацию
    </Button>
  )
}
```

### Пример 3: Табы с предзагрузкой

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { preloadComponent } from '@/lib/lazyComponents'

function TabsWithPreload() {
  const [activeTab, setActiveTab] = useState('forms')

  const tabs = [
    { 
      value: 'forms', 
      label: 'Формы',
      preload: () => import('@/components/examples/RegistrationFormExample')
    },
    { 
      value: 'api', 
      label: 'API',
      preload: () => import('@/components/examples/ApiIntegrationExample')
    },
  ]

  return (
    <div>
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          onMouseEnter={() => preloadComponent(tab.preload)}
          onFocus={() => preloadComponent(tab.preload)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
```

### Пример 4: Условная предзагрузка

```tsx
import { useEffect } from 'react'
import { preloadComponent } from '@/lib/lazyComponents'

function SmartPreloader() {
  useEffect(() => {
    // Предзагружаем только на быстром соединении
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection.effectiveType === '4g') {
        // Предзагружаем тяжелые компоненты
        preloadComponent(() => import('@/components/examples/StateManagementExample'))
        preloadComponent(() => import('@/components/examples/ApiIntegrationExample'))
      }
    }

    // Предзагружаем после idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadComponent(() => import('@/components/examples/FormsExample'))
      })
    }
  }, [])

  return <div>Контент страницы</div>
}
```

## Лучшие практики

### ✅ Когда использовать preloading:

1. **Навигационные ссылки** - предзагружайте страницы при hover
2. **Модальные окна** - предзагружайте перед открытием
3. **Табы** - предзагружайте неактивные табы
4. **Следующий шаг** - в многошаговых формах
5. **Вероятные действия** - на основе поведения пользователя

### ❌ Когда НЕ использовать preloading:

1. **Редко используемые компоненты** - не тратьте bandwidth
2. **Медленное соединение** - проверяйте `navigator.connection`
3. **Мобильные устройства** - будьте осторожны с трафиком
4. **Все сразу** - предзагружайте только вероятные действия

## Мониторинг производительности

```tsx
import { preloadComponent } from '@/lib/lazyComponents'

// С логированием
const preloadWithLogging = async (loader: () => Promise<unknown>) => {
  const start = performance.now()
  
  try {
    await preloadComponent(loader)
    const duration = performance.now() - start
    console.log(`Preloaded in ${duration.toFixed(2)}ms`)
  } catch (error) {
    console.error('Preload failed:', error)
  }
}

// Использование
preloadWithLogging(() => import('@/components/heavy/Component'))
```

## Интеграция с TanStack Router

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { preloadComponent } from '@/lib/lazyComponents'

export const Route = createFileRoute('/examples')({
  component: ExamplesPage,
  // Предзагрузка при загрузке маршрута
  beforeLoad: async () => {
    await preloadComponent(() => import('@/components/examples/RegistrationFormExample'))
  },
})
```

## Заключение

Правильное использование lazy loading и preloading:
- ⚡ Ускоряет начальную загрузку на 30-50%
- 📦 Уменьшает размер начального bundle
- 🎯 Улучшает воспринимаемую производительность
- 💾 Экономит трафик пользователей

Используйте эти техники разумно, основываясь на реальном поведении пользователей!
