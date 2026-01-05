# Документ дизайна: Система маршрутизации на основе прав доступа

## Обзор

Система маршрутизации на основе прав доступа (Permission-Based Routing) предоставляет механизм контроля доступа к маршрутам и элементам навигации в React-приложении. Система интегрируется с TanStack Router, существующей системой аутентификации и локализацией через Lingui.

### Ключевые принципы

1. **Декларативная конфигурация**: Маршруты и их права доступа определяются в централизованной конфигурации
2. **Типобезопасность**: Использование TypeScript типов для всех конфигураций и API
3. **Интеграция с TanStack Router**: Использование beforeLoad хуков для проверки прав доступа
4. **Поддержка локализации**: Сохранение параметров локали во всех переходах
5. **Производительность**: Кэширование прав доступа и ленивая загрузка компонентов

## Архитектура

### Диаграмма компонентов

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Root                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PermissionProvider                        │  │
│  │  - Загрузка прав доступа из API                       │  │
│  │  - Кэширование прав доступа                           │  │
│  │  - Фильтрация маршрутов                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              TanStack Router                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Route Guards (beforeLoad)               │  │  │
│  │  │  - Проверка аутентификации                      │  │  │
│  │  │  - Проверка прав доступа                        │  │  │
│  │  │  - Редиректы                                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              Navigation Component                      │  │
│  │  - Фильтрация меню по правам доступа                  │  │
│  │  - Локализация названий                               │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Поток данных

```
1. Пользователь входит в систему
   ↓
2. AuthContext сохраняет токены
   ↓
3. PermissionProvider запрашивает права доступа из API
   ↓
4. Права доступа кэшируются в контексте
   ↓
5. Маршруты фильтруются на основе прав доступа
   ↓
6. При навигации beforeLoad проверяет права доступа
   ↓
7. Navigation отображает только доступные пункты меню
```

## Типы данных

### Базовые типы прав доступа

```typescript
// src/types/permissions.ts

/**
 * Строка права доступа (например, '/api.manager.dashboard.view')
 */
export type Permission = string

/**
 * Массив прав доступа пользователя
 */
export type UserPermissions = Permission[]

/**
 * Специальное значение для скрытых маршрутов
 */
export type HiddenPermission = 'hidden'

/**
 * Права доступа маршрута: массив строк или специальное значение 'hidden'
 */
export type RoutePermissions = Permission[] | [HiddenPermission] | []

/**
 * Ответ API с правами доступа пользователя
 */
export type PermissionsApiResponse = {
  permissions: UserPermissions
  timestamp: number
}

/**
 * Состояние загрузки прав доступа
 */
export type PermissionsLoadingState = 'idle' | 'loading' | 'success' | 'error'
```

### Типы конфигурации маршрутов

```typescript
// src/types/routes.ts

import type { ReactNode } from 'react'
import type { RoutePermissions } from './permissions'

/**
 * Конфигурация одного маршрута
 */
export type RouteConfig = {
  /** Путь маршрута (без префикса локали) */
  path: string
  
  /** Компонент маршрута (может быть ленивым) */
  element: ReactNode | (() => Promise<{ default: React.ComponentType }>)
  
  /** Название маршрута для отображения в меню */
  name: string
  
  /** Права доступа, необходимые для доступа к маршруту */
  permissions: RoutePermissions
  
  /** Скрыть маршрут из меню (но оставить доступным по URL) */
  isHideInMenu?: boolean
  
  /** Дополнительные метаданные */
  meta?: RouteMetadata
}

/**
 * Метаданные маршрута
 */
export type RouteMetadata = {
  /** Описание маршрута */
  description?: string
  
  /** Иконка для меню */
  icon?: string
  
  /** Порядок сортировки в меню */
  order?: number
  
  /** Дополнительные данные */
  [key: string]: unknown
}

/**
 * Группа маршрутов
 */
export type RouteGroup = {
  /** Идентификатор группы */
  group: string
  
  /** Маршруты в группе */
  items: RouteConfig[]
  
  /** Метаданные группы */
  meta?: {
    /** Название группы для отображения */
    label?: string
    
    /** Иконка группы */
    icon?: string
    
    /** Порядок сортировки */
    order?: number
  }
}

/**
 * Полная конфигурация маршрутов приложения
 */
export type RoutesConfig = RouteGroup[]

/**
 * Отфильтрованный маршрут (доступный пользователю)
 */
export type FilteredRoute = RouteConfig & {
  /** Полный путь с локалью */
  fullPath: string
  
  /** Группа, к которой принадлежит маршрут */
  group: string
}

/**
 * Результат фильтрации маршрутов
 */
export type FilteredRoutesResult = {
  /** Все доступные маршруты */
  routes: FilteredRoute[]
  
  /** Маршруты, сгруппированные по группам */
  groupedRoutes: Map<string, FilteredRoute[]>
  
  /** Первый доступный маршрут (для редиректа по умолчанию) */
  firstRoute: FilteredRoute | null
  
  /** Первый видимый маршрут в меню */
  firstVisibleRoute: FilteredRoute | null
}
```

### Типы контекста прав доступа

```typescript
// src/types/permissions.ts (продолжение)

import type { FilteredRoutesResult } from './routes'

/**
 * Контекст прав доступа
 */
export type PermissionContextValue = {
  /** Права доступа пользователя */
  permissions: UserPermissions
  
  /** Состояние загрузки */
  isLoading: boolean
  
  /** Ошибка загрузки */
  error: Error | null
  
  /** Отфильтрованные маршруты */
  filteredRoutes: FilteredRoutesResult
  
  /** Проверка наличия права доступа */
  hasPermission: (permission: Permission) => boolean
  
  /** Проверка наличия всех прав доступа */
  hasAllPermissions: (permissions: Permission[]) => boolean
  
  /** Проверка наличия хотя бы одного права доступа */
  hasAnyPermission: (permissions: Permission[]) => boolean
  
  /** Проверка доступа к маршруту */
  canAccessRoute: (routePath: string) => boolean
  
  /** Перезагрузка прав доступа */
  refetchPermissions: () => Promise<void>
}

/**
 * Пропсы провайдера прав доступа
 */
export type PermissionProviderProps = {
  children: ReactNode
  
  /** Конфигурация маршрутов */
  routesConfig: RoutesConfig
  
  /** Функция для загрузки прав доступа */
  fetchPermissions?: () => Promise<UserPermissions>
}
```

## Компоненты и интерфейсы

### 1. PermissionProvider

**Расположение**: `src/contexts/PermissionContext.tsx`

**Назначение**: Управление правами доступа пользователя и фильтрация маршрутов

**Ключевые функции**:
- Загрузка прав доступа из API при монтировании
- Кэширование прав доступа в контексте
- Фильтрация маршрутов на основе прав доступа
- Предоставление утилит для проверки прав доступа

**Состояние**:
```typescript
type PermissionState = {
  permissions: UserPermissions
  isLoading: boolean
  error: Error | null
  filteredRoutes: FilteredRoutesResult
}
```

**API методы**:
- `hasPermission(permission: Permission): boolean` - проверка одного права
- `hasAllPermissions(permissions: Permission[]): boolean` - проверка всех прав
- `hasAnyPermission(permissions: Permission[]): boolean` - проверка хотя бы одного права
- `canAccessRoute(routePath: string): boolean` - проверка доступа к маршруту
- `refetchPermissions(): Promise<void>` - перезагрузка прав доступа

### 2. Утилиты фильтрации маршрутов

**Расположение**: `src/utils/permissions.ts`

**Функции**:

```typescript
/**
 * Фильтрация маршрутов на основе прав доступа пользователя
 */
export type FilterRoutesByPermissions = (
  routesConfig: RoutesConfig,
  userPermissions: UserPermissions,
  locale: string
) => FilteredRoutesResult

/**
 * Проверка, имеет ли пользователь доступ к маршруту
 */
export type CheckRouteAccess = (
  routePermissions: RoutePermissions,
  userPermissions: UserPermissions
) => boolean

/**
 * Получение первого доступного маршрута
 */
export type GetFirstAccessibleRoute = (
  filteredRoutes: FilteredRoute[],
  preferVisible?: boolean
) => FilteredRoute | null

/**
 * Проверка, является ли маршрут скрытым
 */
export type IsHiddenRoute = (
  routePermissions: RoutePermissions
) => boolean
```

### 3. Route Guards

**Расположение**: `src/guards/permissionGuard.ts`

**Назначение**: Проверка прав доступа перед загрузкой маршрута

**Функция**:
```typescript
/**
 * Guard для проверки прав доступа в beforeLoad хуке TanStack Router
 */
export type CreatePermissionGuard = (
  requiredPermissions: RoutePermissions
) => (context: BeforeLoadContext) => Promise<void> | void
```

**Логика работы**:
1. Получить права доступа из PermissionContext
2. Проверить, загружены ли права доступа
3. Если права не загружены, показать загрузку
4. Проверить наличие требуемых прав доступа
5. Если прав нет, выполнить редирект на доступный маршрут
6. Если права есть, разрешить доступ

### 4. Navigation Component

**Расположение**: `src/components/common/Navigation.tsx` (обновление существующего)

**Назначение**: Отображение навигационного меню с фильтрацией по правам доступа

**Изменения**:
- Использовать `usePermissionContext()` для получения отфильтрованных маршрутов
- Отображать только маршруты из `filteredRoutes.groupedRoutes`
- Исключать маршруты с `isHideInMenu: true`
- Поддерживать группировку маршрутов

### 5. Конфигурация маршрутов

**Расположение**: `src/config/routes.ts`

**Назначение**: Централизованная конфигурация всех маршрутов приложения

**Пример структуры**:
```typescript
export const ROUTES_CONFIG: RoutesConfig = [
  {
    group: 'dashboard',
    meta: {
      label: 'Панель управления',
      icon: 'dashboard',
      order: 1
    },
    items: [
      {
        path: 'dashboard',
        element: lazy(() => import('@/pages/Dashboard')),
        name: 'Главная панель',
        permissions: [
          '/api.manager.dashboard.view',
          '/api.manager.dashboard.stats'
        ]
      },
      {
        path: 'analytics',
        element: lazy(() => import('@/pages/Analytics')),
        name: 'Аналитика',
        permissions: ['/api.manager.analytics.view']
      }
    ]
  },
  {
    group: 'settings',
    meta: {
      label: 'Настройки',
      icon: 'settings',
      order: 10
    },
    items: [
      {
        path: 'settings',
        element: lazy(() => import('@/pages/Settings')),
        name: 'Настройки',
        permissions: [] // Доступно всем аутентифицированным
      },
      {
        path: 'admin',
        element: lazy(() => import('@/pages/Admin')),
        name: 'Администрирование',
        permissions: ['/api.manager.admin.access'],
        isHideInMenu: false
      }
    ]
  }
]
```

## Интеграция с TanStack Router

### Структура маршрутов

Существующая структура:
```
src/routes/
  __root.tsx
  $locale/
    _layout.tsx
    _layout/
      _authenticated.tsx
      _authenticated/
        dashboard.tsx
        profile.tsx
        ...
```

### Динамическая генерация маршрутов

Вместо создания файлов для каждого маршрута, будем использовать программную генерацию:

**Расположение**: `src/routes/$locale/_layout/_authenticated.tsx` (обновление)

```typescript
// Обновленный _authenticated.tsx с динамической генерацией маршрутов
export const Route = createFileRoute("/$locale/_layout/_authenticated")({
  beforeLoad: async ({ location, params, context }) => {
    const { isAuthenticated } = useAuthStore.getState()
    const { locale } = params

    // Проверка аутентификации
    if (!isAuthenticated) {
      throw redirect({
        to: "/$locale/_layout/login",
        params: { locale },
        search: { redirect: location.href }
      })
    }

    // Загрузка прав доступа (если еще не загружены)
    // Это будет обрабатываться PermissionProvider
  },
  component: AuthenticatedLayoutWithRoutes
})
```

### Альтернативный подход: Файловая структура с guards

Если предпочтительнее сохранить файловую структуру TanStack Router, каждый маршрут будет использовать guard:

```typescript
// src/routes/$locale/_layout/_authenticated/dashboard.tsx
import { createPermissionGuard } from '@/guards/permissionGuard'

export const Route = createFileRoute("/$locale/_layout/_authenticated/dashboard")({
  beforeLoad: createPermissionGuard([
    '/api.manager.dashboard.view',
    '/api.manager.dashboard.stats'
  ]),
  component: DashboardPage
})
```

## API интеграция

### Endpoint для получения прав доступа

**URL**: `GET /api/permissions` или `GET /api/user/permissions`

**Ответ**:
```typescript
{
  permissions: [
    '/api.manager.dashboard.view',
    '/api.manager.dashboard.stats',
    '/api.manager.users.list',
    '/api.manager.users.create',
    // ...
  ],
  timestamp: 1234567890
}
```

### API клиент

**Расположение**: `src/api/permissions.ts`

```typescript
/**
 * Получение прав доступа текущего пользователя
 */
export type FetchUserPermissions = () => Promise<UserPermissions>

/**
 * Проверка права доступа на сервере
 */
export type CheckPermissionOnServer = (
  permission: Permission
) => Promise<boolean>
```

## Обработка ошибок

### Типы ошибок

```typescript
// src/types/permissions.ts (продолжение)

/**
 * Ошибка прав доступа
 */
export type PermissionError = {
  type: 'permission_denied' | 'permission_load_failed' | 'invalid_permission'
  message: string
  requiredPermissions?: Permission[]
  userPermissions?: UserPermissions
}
```

### Стратегии обработки

1. **Ошибка загрузки прав доступа**:
   - Показать сообщение об ошибке
   - Предложить повторить попытку
   - Заблокировать доступ к защищенным маршрутам

2. **Отсутствие прав доступа**:
   - Редирект на первый доступный маршрут
   - Если нет доступных маршрутов, показать страницу "Доступ запрещен"

3. **Недействительное право доступа**:
   - Логировать ошибку в консоль (dev mode)
   - Считать маршрут недоступным

## Стратегия тестирования

### Unit тесты

1. **Утилиты фильтрации**:
   - Тест фильтрации маршрутов с различными правами доступа
   - Тест обработки скрытых маршрутов
   - Тест получения первого доступного маршрута

2. **Permission guards**:
   - Тест проверки прав доступа
   - Тест редиректов при отсутствии прав
   - Тест интеграции с TanStack Router

3. **PermissionContext**:
   - Тест загрузки прав доступа
   - Тест кэширования
   - Тест методов проверки прав

### Integration тесты

1. **Полный flow аутентификации и прав доступа**:
   - Вход пользователя
   - Загрузка прав доступа
   - Фильтрация маршрутов
   - Навигация по доступным маршрутам

2. **Навигация**:
   - Отображение только доступных пунктов меню
   - Скрытие недоступных маршрутов
   - Корректная работа с локализацией

## Производительность

### Оптимизации

1. **Кэширование прав доступа**:
   - Права доступа загружаются один раз при входе
   - Кэш инвалидируется при выходе из системы

2. **Мемоизация фильтрации маршрутов**:
   - Использование `useMemo` для фильтрации маршрутов
   - Пересчет только при изменении прав доступа или конфигурации

3. **Ленивая загрузка компонентов**:
   - Все компоненты маршрутов загружаются лениво
   - Использование `React.lazy()` и динамических импортов

4. **Оптимизация проверок прав доступа**:
   - Использование Set для быстрого поиска прав доступа
   - Кэширование результатов проверок

## Миграция с существующей системы

### Шаги миграции

1. **Создание типов и утилит**:
   - Добавить типы прав доступа
   - Реализовать утилиты фильтрации

2. **Создание PermissionProvider**:
   - Реализовать контекст
   - Интегрировать с AuthContext

3. **Создание конфигурации маршрутов**:
   - Перенести существующие маршруты в конфигурацию
   - Добавить права доступа для каждого маршрута

4. **Обновление Navigation**:
   - Добавить фильтрацию по правам доступа
   - Сохранить существующую функциональность

5. **Добавление guards**:
   - Создать permission guards
   - Добавить в существующие маршруты

6. **Тестирование**:
   - Проверить все маршруты
   - Проверить навигацию
   - Проверить редиректы

### Обратная совместимость

- Маршруты без указанных прав доступа доступны всем аутентифицированным пользователям
- Существующие маршруты продолжают работать
- Постепенное добавление прав доступа к маршрутам

## Расширяемость

### Будущие улучшения

1. **Условные права доступа**:
   - Права доступа на основе контекста (например, владелец ресурса)
   - Динамические права доступа

2. **Иерархия прав доступа**:
   - Наследование прав доступа
   - Группы прав доступа

3. **Аудит прав доступа**:
   - Логирование попыток доступа
   - Аналитика использования прав доступа

4. **UI для управления правами доступа**:
   - Админ-панель для управления правами
   - Визуализация прав доступа пользователей
