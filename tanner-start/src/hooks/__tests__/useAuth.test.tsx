import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useAuth } from '../useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

/**
 * Мокаем Zustand store
 */
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

/**
 * Мокаем хуки запросов
 */
vi.mock('../useQueries', () => ({
  useLogin: vi.fn(),
  useLogout: vi.fn(),
  useProfile: vi.fn(),
}))

/**
 * Создаем wrapper для тестов с провайдерами
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should return initial unauthenticated state', () => {
      // Мокаем store с начальным состоянием
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      // Мокаем хуки запросов
      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should return authenticated state when user is logged in', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        role: 'user' as const,
        accessToken: 'token',
        refreshToken: 'refresh',
      }

      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: mockUser,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.profile).toEqual(mockUser)
    })
  })

  describe('Loading States', () => {
    it('should combine loading states from store and mutations', () => {
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true, // Store loading
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should show loading when login mutation is pending', () => {
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true, // Login pending
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should combine errors from different sources', () => {
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Store error',
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: { message: 'Login error' },
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Должна быть ошибка из store (приоритет)
      expect(result.current.error).toBe('Store error')
    })

    it('should show login error when store error is null', () => {
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: { message: 'Login failed' },
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.error).toBe('Login failed')
    })
  })

  describe('Authentication Actions', () => {
    it('should call login mutation when signIn is called', async () => {
      const mockLoginMutation = vi.fn().mockResolvedValue(undefined)
      const mockClearError = vi.fn()

      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        clearError: mockClearError,
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: mockLoginMutation,
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      expect(mockClearError).toHaveBeenCalled()
      expect(mockLoginMutation).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should call logout mutation when signOut is called', async () => {
      const mockLogoutMutation = vi.fn().mockResolvedValue(undefined)
      const mockClearError = vi.fn()

      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: { id: '1', name: 'Test' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        clearError: mockClearError,
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: mockLogoutMutation,
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockClearError).toHaveBeenCalled()
      expect(mockLogoutMutation).toHaveBeenCalled()
    })
  })

  describe('Role-based Access Control', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      role: 'user' as const,
      accessToken: 'token',
      refreshToken: 'refresh',
    }

    beforeEach(() => {
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: mockUser,
        isLoading: false,
        error: null,
      })
    })

    it('should check user role correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('admin')).toBe(false)
      expect(result.current.hasRole('moderator')).toBe(false)
    })

    it('should check access permissions correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Пользователь может получить доступ к user-level ресурсам
      expect(result.current.canAccess('user')).toBe(true)
      
      // Пользователь не может получить доступ к admin/moderator ресурсам
      expect(result.current.canAccess('admin')).toBe(false)
      expect(result.current.canAccess('moderator')).toBe(false)
      
      // Пользователь может получить доступ к ресурсам без требований к роли
      expect(result.current.canAccess()).toBe(true)
    })

    it('should handle admin role hierarchy', () => {
      const adminUser = { ...mockUser, role: 'admin' as const }
      
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: adminUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.canAccess('admin')).toBe(true)
      expect(result.current.canAccess('moderator')).toBe(true)
      expect(result.current.canAccess('user')).toBe(true)
    })

    it('should handle moderator role hierarchy', () => {
      const moderatorUser = { ...mockUser, role: 'moderator' as const }
      
      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: moderatorUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.canAccess('admin')).toBe(false)
      expect(result.current.canAccess('moderator')).toBe(true)
      expect(result.current.canAccess('user')).toBe(true)
    })
  })

  describe('Backward Compatibility', () => {
    it('should provide backward compatible login/logout methods', async () => {
      const mockLoginMutation = vi.fn().mockResolvedValue(undefined)
      const mockLogoutMutation = vi.fn().mockResolvedValue(undefined)

      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: mockLoginMutation,
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: mockLogoutMutation,
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Проверяем, что старые методы login/logout доступны
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')

      // Проверяем, что они работают как signIn/signOut
      await act(async () => {
        await result.current.login('test@example.com', 'password')
      })

      expect(mockLoginMutation).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(mockLogoutMutation).toHaveBeenCalled()
    })
  })

  describe('Profile Data Integration', () => {
    it('should provide profile data from server', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        accessToken: 'token',
        refreshToken: 'refresh',
      }

      const mockProfile = {
        ...mockUser,
        avatar: 'https://server.com/avatar.jpg',
        name: 'Updated Name',
      }

      vi.mocked(require('@/stores/authStore').useAuthStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      })

      vi.mocked(require('../useQueries').useLogin).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useLogout).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      })

      vi.mocked(require('../useQueries').useProfile).mockReturnValue({
        data: mockProfile,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.profile).toEqual(mockProfile)
      expect(result.current.isProfileLoading).toBe(false)
      expect(result.current.profileError).toBeNull()
    })
  })
})