import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import { routeGuardUtils } from '@/components/guards/RouteGuard'

/**
 * Интерфейс пропсов для AuthRedirect
 */
interface AuthRedirectProps {
  /**
   * Путь для перенаправления авторизованных пользователей
   */
  authenticatedPath?: string
  
  /**
   * Путь для перенаправления неавторизованных пользователей
   */
  unauthenticatedPath?: string
  
  /**
   * Задержка перед перенаправлением (в миллисекундах)
   */
  delay?: number
}

/**
 * Компонент для автоматического перенаправления на основе статуса аутентификации
 */
export function AuthRedirect({
  authenticatedPath = '/dashboard',
  unauthenticatedPath = '/login',
  delay = 0,
}: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const navigate = useNavigate()
  const search = useSearch({ from: '/' })

  useEffect(() => {
    if (isLoading) return

    const redirect = () => {
      if (isAuthenticated) {
        // Если пользователь авторизован, перенаправляем на защищенную страницу
        const redirectUrl = routeGuardUtils.getRedirectUrl(
          new URLSearchParams(search as any),
          authenticatedPath
        )
        navigate({ to: redirectUrl })
      } else {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        navigate({ to: unauthenticatedPath })
      }
    }

    if (delay > 0) {
      const timer = setTimeout(redirect, delay)
      return () => clearTimeout(timer)
    } else {
      redirect()
    }
  }, [isAuthenticated, isLoading, navigate, search, authenticatedPath, unauthenticatedPath, delay])

  // Показываем загрузку во время проверки и перенаправления
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">
          {isLoading ? 'Проверка аутентификации...' : 'Перенаправление...'}
        </p>
      </div>
    </div>
  )
}

/**
 * Компонент для перенаправления на главную страницу после входа
 */
export function LoginRedirect() {
  const search = useSearch({ from: '/login' })
  
  return (
    <AuthRedirect
      authenticatedPath={routeGuardUtils.getRedirectUrl(
        new URLSearchParams(search as any),
        '/dashboard'
      )}
      unauthenticatedPath="/login"
    />
  )
}

/**
 * Компонент для перенаправления неавторизованных пользователей
 */
export function ProtectedRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthRedirect unauthenticatedPath="/login" />
  }

  return <>{children}</>
}

/**
 * Хук для программного перенаправления
 */
export function useAuthRedirect() {
  const { isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  return {
    /**
     * Перенаправление на страницу входа
     */
    redirectToLogin: (currentPath?: string) => {
      const loginUrl = currentPath 
        ? routeGuardUtils.createLoginUrl(currentPath)
        : '/login'
      navigate({ to: loginUrl })
    },

    /**
     * Перенаправление на главную страницу
     */
    redirectToDashboard: () => {
      navigate({ to: '/dashboard' })
    },

    /**
     * Перенаправление на основе статуса аутентификации
     */
    redirectBasedOnAuth: (
      authenticatedPath = '/dashboard',
      unauthenticatedPath = '/login'
    ) => {
      const path = isAuthenticated ? authenticatedPath : unauthenticatedPath
      navigate({ to: path })
    },

    /**
     * Перенаправление с сохранением текущего пути
     */
    redirectWithReturn: (targetPath: string, returnPath?: string) => {
      const url = returnPath 
        ? `${targetPath}?redirect=${encodeURIComponent(returnPath)}`
        : targetPath
      navigate({ to: url })
    },
  }
}