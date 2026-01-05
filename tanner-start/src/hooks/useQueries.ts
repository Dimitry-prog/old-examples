import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, usersApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { AuthUser } from '@/types'

/**
 * Ключи для запросов - централизованное управление
 */
export const queryKeys = {
  // Аутентификация
  auth: ['auth'] as const,
  profile: () => [...queryKeys.auth, 'profile'] as const,
  
  // Пользователи
  users: ['users'] as const,
  usersList: (params?: { page?: number; limit?: number; search?: string }) => 
    [...queryKeys.users, 'list', params] as const,
  user: (id: string) => [...queryKeys.users, 'detail', id] as const,
} as const

/**
 * Хук для получения профиля пользователя
 */
export function useProfile() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: (failureCount, error) => {
      // Не повторяем запрос, если пользователь не авторизован
      if ((error as any)?.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Хук для входа в систему
 */
export function useLogin() {
  const queryClient = useQueryClient()
  const { login: setAuthUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      // Обновляем состояние аутентификации
      setAuthUser(user)
      
      // Инвалидируем и обновляем кеш профиля
      queryClient.setQueryData(queryKeys.profile(), user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })
}

/**
 * Хук для выхода из системы
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const { logout: clearAuthUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Очищаем состояние аутентификации
      clearAuthUser()
      
      // Очищаем весь кеш связанный с аутентификацией
      queryClient.removeQueries({ queryKey: queryKeys.auth })
      queryClient.removeQueries({ queryKey: queryKeys.users })
      
      // Можно также очистить весь кеш
      // queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Даже если запрос на сервер не удался, очищаем локальное состояние
      clearAuthUser()
      queryClient.removeQueries({ queryKey: queryKeys.auth })
    },
  })
}

/**
 * Хук для получения списка пользователей
 */
export function useUsers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.usersList(params),
    queryFn: () => usersApi.getUsers(params),
    staleTime: 1000 * 60 * 2, // 2 минуты
    placeholderData: (previousData) => previousData, // Показываем предыдущие данные во время загрузки
  })
}

/**
 * Хук для получения пользователя по ID
 */
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersApi.getUser(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}

/**
 * Хук для создания пользователя
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: (newUser) => {
      // Инвалидируем список пользователей
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      
      // Добавляем нового пользователя в кеш
      queryClient.setQueryData(queryKeys.user(newUser.id), newUser)
    },
    onError: (error) => {
      console.error('Failed to create user:', error)
    },
  })
}

/**
 * Хук для обновления пользователя
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AuthUser> }) => 
      usersApi.updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Обновляем данные пользователя в кеше
      queryClient.setQueryData(queryKeys.user(id), updatedUser)
      
      // Инвалидируем список пользователей
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      
      // Если обновляем текущего пользователя, обновляем профиль
      const currentUser = queryClient.getQueryData<AuthUser>(queryKeys.profile())
      if (currentUser?.id === id) {
        queryClient.setQueryData(queryKeys.profile(), updatedUser)
      }
    },
    onError: (error) => {
      console.error('Failed to update user:', error)
    },
  })
}

/**
 * Хук для удаления пользователя
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: (_, deletedId) => {
      // Удаляем пользователя из кеша
      queryClient.removeQueries({ queryKey: queryKeys.user(deletedId) })
      
      // Инвалидируем список пользователей
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
    onError: (error) => {
      console.error('Failed to delete user:', error)
    },
  })
}

/**
 * Хук для предварительной загрузки данных пользователя
 */
export function usePrefetchUser() {
  const queryClient = useQueryClient()
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.user(id),
      queryFn: () => usersApi.getUser(id),
      staleTime: 1000 * 60 * 5, // 5 минут
    })
  }
}

/**
 * Хук для работы с оптимистичными обновлениями
 */
export function useOptimisticUserUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AuthUser> }) => 
      usersApi.updateUser(id, data),
    
    // Оптимистичное обновление
    onMutate: async ({ id, data }) => {
      // Отменяем все активные запросы для этого пользователя
      await queryClient.cancelQueries({ queryKey: queryKeys.user(id) })
      
      // Сохраняем предыдущие данные для отката
      const previousUser = queryClient.getQueryData<AuthUser>(queryKeys.user(id))
      
      // Оптимистично обновляем данные
      if (previousUser) {
        queryClient.setQueryData(queryKeys.user(id), { ...previousUser, ...data })
      }
      
      return { previousUser }
    },
    
    // Если мутация не удалась, откатываем изменения
    onError: (error, { id }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user(id), context.previousUser)
      }
      console.error('Optimistic update failed:', error)
    },
    
    // Всегда инвалидируем запросы после завершения
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
    },
  })
}