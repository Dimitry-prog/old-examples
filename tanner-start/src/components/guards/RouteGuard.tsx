import { ReactNode } from 'react'
import { Navigate, useLocation } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import type { AuthUser } from '@/types'

/**
 * Интерфейс пропсов для RouteGuard
 */
interface RouteGuardProps {
  children: ReactNode
  requiredRole?: AuthUser['role']
  fallbackPath?: string
  showLoading?: boolean
}

/**
 * Компонент для защиты маршрутов
 */
export function RouteGuard({ 
  children, 
  requiredRole, 
  fallbackPath = '/login',
  showLoading = true 
}: RouteGuardProps) {
  const { isAuthenticated, canAccess, isLoading } = useAuthContext()
  const location = useLocation()

  // Показываем загрузку во время проверки аутентификации
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    )
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    const redirectUrl = `${fallbackPath}?redirect=${encodeURIComponent(location.pathname + location.search)}`
    return <Navigate to={redirectUrl} replace />
  }

  // Если недостаточно прав, показываем ошибку доступа
  if (!canAccess(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Доступ запрещен</h2>
          <p className="text-muted-foreground mb-4">
            У вас недостаточно прав для доступа к этой странице.
            {requiredRole && ` Требуется роль: ${requiredRole}`}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  // Если все проверки пройдены, отображаем дочерние компоненты
  return <>{children}</>
}

/**
 * Компонент для защиты маршрутов администратора
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="admin">
      {children}
    </RouteGuard>
  )
}

/**
 * Компонент для защиты маршрутов модератора
 */
export function ModeratorGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="moderator">
      {children}
    </RouteGuard>
  )
}

/**
 * Компонент для защиты любых авторизованных маршрутов
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  )
}

/**
 * Компонент для маршрутов, доступных только неавторизованным пользователям
 */
export function GuestGuard({ 
  children, 
  redirectPath = '/dashboard' 
}: { 
  children: ReactNode
  redirectPath?: string 
}) {
  const { isAuthenticated, isLoading } = useAuthContext()

  // Показываем загрузку во время проверки
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Если пользователь авторизован, перенаправляем на главную страницу
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  // Если пользователь не авторизован, показываем контент
  return <>{children}</>
}

/**
 * Хук для условного рендеринга на основе ролей
 */
export function useRoleGuard() {
  const { hasRole, canAccess, isAuthenticated } = useAuthContext()

  return {
    /**
     * Проверка, может ли пользователь видеть контент
     */
    canView: (requiredRole?: AuthUser['role']) => {
      return isAuthenticated && canAccess(requiredRole)
    },

    /**
     * Проверка конкретной роли
     */
    isRole: (role: AuthUser['role']) => {
      return isAuthenticated && hasRole(role)
    },

    /**
     * Проверка, является ли пользователь администратором
     */
    isAdmin: () => hasRole('admin'),

    /**
     * Проверка, является ли пользователь модератором или выше
     */
    isModerator: () => canAccess('moderator'),

    /**
     * Проверка, авторизован ли пользователь
     */
    isAuthenticated,
  }
}

/**
 * Компонент для условного рендеринга на основе ролей
 */
interface RoleBasedRenderProps {
  requiredRole?: AuthUser['role']
  children: ReactNode
  fallback?: ReactNode
}

export function RoleBasedRender({ 
  requiredRole, 
  children, 
  fallback = null 
}: RoleBasedRenderProps) {
  const { canView } = useRoleGuard()

  if (canView(requiredRole)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Утилиты для работы с защищенными маршрутами
 */
export const routeGuardUtils = {
  /**
   * Создание защищенного маршрута
   */
  createProtectedRoute: (
    component: ReactNode,
    requiredRole?: AuthUser['role']
  ) => {
    return (
      <RouteGuard requiredRole={requiredRole}>
        {component}
      </RouteGuard>
    )
  },

  /**
   * Создание маршрута только для гостей
   */
  createGuestRoute: (component: ReactNode, redirectPath?: string) => {
    return (
      <GuestGuard redirectPath={redirectPath}>
        {component}
      </GuestGuard>
    )
  },

  /**
   * Получение URL для перенаправления после входа
   */
  getRedirectUrl: (searchParams: URLSearchParams, defaultPath = '/dashboard') => {
    const redirect = searchParams.get('redirect')
    return redirect && redirect.startsWith('/') ? redirect : defaultPath
  },

  /**
   * Создание URL для входа с перенаправлением
   */
  createLoginUrl: (currentPath: string, loginPath = '/login') => {
    return `${loginPath}?redirect=${encodeURIComponent(currentPath)}`
  },
}