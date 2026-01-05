import { useAuthStore } from '@/stores/authStore'
import { useLogin, useLogout, useProfile } from './useQueries'
import type { AuthUser } from '@/types'

/**
 * Хук для работы с аутентификацией
 * Предоставляет удобный интерфейс для работы с состоянием аутентификации
 * Интегрирован с TanStack Query для серверного состояния
 */
export function useAuth() {
    const {
        user,
        isAuthenticated,
        isLoading: storeLoading,
        error: storeError,
        clearError,
    } = useAuthStore()

    // Хуки для работы с сервером
    const loginMutation = useLogin()
    const logoutMutation = useLogout()
    const profileQuery = useProfile()

    // Объединяем состояния загрузки
    const isLoading = storeLoading || loginMutation.isPending || logoutMutation.isPending

    // Объединяем ошибки
    const error = storeError ||
        (loginMutation.error?.message) ||
        (logoutMutation.error?.message) ||
        (profileQuery.error?.message)

    /**
     * Функция входа в систему
     */
    const signIn = async (email: string, password: string) => {
        clearError()
        return loginMutation.mutateAsync({ email, password })
    }

    /**
     * Функция выхода из системы
     */
    const signOut = async () => {
        clearError()
        return logoutMutation.mutateAsync()
    }

    /**
     * Проверка роли пользователя
     */
    const hasRole = (role: AuthUser['role']) => {
        return user?.role === role
    }

    /**
     * Проверка прав доступа
     */
    const canAccess = (requiredRole?: AuthUser['role']) => {
        if (!isAuthenticated || !user) return false
        if (!requiredRole) return true

        // Иерархия ролей: admin > moderator > user
        const roleHierarchy = {
            admin: 3,
            moderator: 2,
            user: 1,
        }

        return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
    }

    return {
        // Состояние
        user,
        isAuthenticated,
        isLoading,
        error,

        // Данные профиля с сервера
        profile: profileQuery.data,
        isProfileLoading: profileQuery.isLoading,
        profileError: profileQuery.error,

        // Действия
        signIn,
        signOut,
        clearError,

        // Утилиты
        hasRole,
        canAccess,

        // Для обратной совместимости
        login: signIn,
        logout: signOut,
    }
}