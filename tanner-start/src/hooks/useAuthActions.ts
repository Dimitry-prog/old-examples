import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import { useLogin, useLogout } from '@/hooks/useQueries'
import { routeGuardUtils } from '@/components/guards/RouteGuard'
import type { AuthUser } from '@/types'

/**
 * Интерфейс для данных входа
 */
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

/**
 * Интерфейс для данных регистрации
 */
export interface RegisterData {
  email: string
  password: string
  name: string
  confirmPassword: string
}

/**
 * Хук для действий аутентификации
 */
export function useAuthActions() {
  const navigate = useNavigate()
  const { clearError } = useAuthContext()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  /**
   * Вход в систему
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      clearError()
      
      const user = await loginMutation.mutateAsync({
        email: credentials.email,
        password: credentials.password,
      })

      // Получаем URL для перенаправления
      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = routeGuardUtils.getRedirectUrl(searchParams, '/dashboard')
      
      // Перенаправляем пользователя
      navigate({ to: redirectUrl })
      
      return user
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [loginMutation, navigate, clearError])

  /**
   * Выход из системы
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
      
      // Перенаправляем на главную страницу
      navigate({ to: '/' })
    } catch (error) {
      console.error('Logout failed:', error)
      // Даже если запрос не удался, перенаправляем пользователя
      navigate({ to: '/' })
    }
  }, [logoutMutation, navigate])

  /**
   * Регистрация (заглушка)
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      clearError()
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Пароли не совпадают')
      }

      // В реальном приложении здесь будет API запрос
      // const user = await authApi.register(data)
      
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: AuthUser = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: 'user',
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      }

      // Автоматически входим после регистрации
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })

      // Перенаправляем на dashboard
      navigate({ to: '/dashboard' })
      
      return mockUser
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }, [loginMutation, navigate, clearError])

  /**
   * Сброс пароля (заглушка)
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      clearError()
      
      // В реальном приложении здесь будет API запрос
      // await authApi.resetPassword(email)
      
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { message: 'Инструкции по сбросу пароля отправлены на email' }
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }, [clearError])

  /**
   * Изменение пароля (заглушка)
   */
  const changePassword = useCallback(async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      clearError()
      
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Новые пароли не совпадают')
      }

      // В реальном приложении здесь будет API запрос
      // await authApi.changePassword(data)
      
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { message: 'Пароль успешно изменен' }
    } catch (error) {
      console.error('Password change failed:', error)
      throw error
    }
  }, [clearError])

  return {
    // Действия
    login,
    logout,
    register,
    resetPassword,
    changePassword,
    
    // Состояния
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    
    // Ошибки
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  }
}

/**
 * Хук для проверки прав доступа
 */
export function usePermissions() {
  const { user, isAuthenticated, canAccess, hasRole } = useAuthContext()

  return {
    // Базовые проверки
    isAuthenticated,
    user,
    
    // Проверки ролей
    isAdmin: useCallback(() => hasRole('admin'), [hasRole]),
    isModerator: useCallback(() => hasRole('moderator'), [hasRole]),
    isUser: useCallback(() => hasRole('user'), [hasRole]),
    
    // Проверки доступа
    canAccessAdmin: useCallback(() => canAccess('admin'), [canAccess]),
    canAccessModerator: useCallback(() => canAccess('moderator'), [canAccess]),
    canAccessUser: useCallback(() => canAccess('user'), [canAccess]),
    
    // Универсальные проверки
    hasRole: useCallback((role: AuthUser['role']) => hasRole(role), [hasRole]),
    canAccess: useCallback((role?: AuthUser['role']) => canAccess(role), [canAccess]),
    
    // Проверки конкретных разрешений
    canEditUser: useCallback((targetUserId: string) => {
      if (!isAuthenticated || !user) return false
      
      // Админы могут редактировать всех
      if (hasRole('admin')) return true
      
      // Модераторы могут редактировать обычных пользователей
      if (hasRole('moderator')) return true
      
      // Пользователи могут редактировать только себя
      return user.id === targetUserId
    }, [isAuthenticated, user, hasRole]),
    
    canDeleteUser: useCallback((targetUserId: string) => {
      if (!isAuthenticated || !user) return false
      
      // Только админы могут удалять пользователей
      if (hasRole('admin')) return true
      
      // Пользователи могут удалить только свой аккаунт
      return user.id === targetUserId
    }, [isAuthenticated, user, hasRole]),
    
    canViewAdminPanel: useCallback(() => canAccess('admin'), [canAccess]),
    canViewModeratorPanel: useCallback(() => canAccess('moderator'), [canAccess]),
  }
}

/**
 * Хук для работы с сессией
 */
export function useSession() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    refreshTokens, 
    isTokenExpired 
  } = useAuthContext()

  /**
   * Проверка активности сессии
   */
  const checkSession = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return { valid: false, reason: 'not_authenticated' }
    }

    if (isTokenExpired()) {
      try {
        await refreshTokens()
        return { valid: true, reason: 'token_refreshed' }
      } catch (error) {
        return { valid: false, reason: 'token_refresh_failed' }
      }
    }

    return { valid: true, reason: 'valid' }
  }, [isAuthenticated, user, isTokenExpired, refreshTokens])

  /**
   * Получение информации о сессии
   */
  const getSessionInfo = useCallback(() => {
    if (!isAuthenticated || !user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isTokenExpired: isTokenExpired(),
      // В реальном приложении здесь можно добавить время истечения токена
      // expiresAt: jwt.decode(user.accessToken).exp * 1000,
    }
  }, [isAuthenticated, user, isTokenExpired])

  return {
    // Состояние сессии
    isAuthenticated,
    isLoading,
    user,
    
    // Методы
    checkSession,
    getSessionInfo,
    refreshTokens,
    
    // Утилиты
    isTokenExpired,
  }
}

/**
 * Хук для автоматического выхода при неактивности
 */
export function useAutoLogout(timeoutMinutes = 30) {
  const { logout } = useAuthActions()
  const { isAuthenticated } = useAuthContext()

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return

    // Очищаем предыдущий таймер
    if (window.autoLogoutTimer) {
      clearTimeout(window.autoLogoutTimer)
    }

    // Устанавливаем новый таймер
    window.autoLogoutTimer = setTimeout(() => {
      logout()
      alert('Сессия истекла из-за неактивности')
    }, timeoutMinutes * 60 * 1000)
  }, [isAuthenticated, logout, timeoutMinutes])

  // Сбрасываем таймер при активности пользователя
  const handleUserActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  // Подписываемся на события активности
  useCallback(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    // Запускаем таймер
    resetTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
      
      if (window.autoLogoutTimer) {
        clearTimeout(window.autoLogoutTimer)
      }
    }
  }, [isAuthenticated, handleUserActivity, resetTimer])

  return {
    resetTimer,
  }
}

// Расширяем глобальный объект Window для таймера
declare global {
  interface Window {
    autoLogoutTimer?: NodeJS.Timeout
  }
}