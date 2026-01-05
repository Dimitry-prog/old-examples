import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderComponent, formTestHelpers, authTestHelpers } from '@/test/component-utils'
import { LoginForm } from '@/components/forms/LoginForm'
import { Navigation } from '@/components/common/Navigation'

/**
 * Интеграционные тесты для потока аутентификации
 */
describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authTestHelpers.clearAuthState()
  })

  describe('Login Flow', () => {
    it('should complete full login flow', async () => {
      // Мокаем успешный вход
      const mockSignIn = vi.fn().mockResolvedValue(undefined)
      
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: mockSignIn,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      const { user } = renderComponent(<LoginForm />)

      // 1. Заполняем форму
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      // 2. Отправляем форму
      const submitButton = screen.getByRole('button', { name: /войти/i })
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.click(submitButton)

      // 3. Проверяем, что вызвался signIn
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should handle login errors gracefully', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: mockSignIn,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Invalid credentials',
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      const { user } = renderComponent(<LoginForm />)

      // Заполняем форму с неверными данными
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      await formTestHelpers.fillInput(user, emailInput, 'wrong@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /войти/i })
      await user.click(submitButton)

      // Проверяем отображение ошибки
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('should show loading state during login', async () => {
      const mockSignIn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: mockSignIn,
          isAuthenticated: false,
          user: null,
          isLoading: true,
          error: null,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      renderComponent(<LoginForm />)

      // Проверяем состояние загрузки
      expect(screen.getByRole('button', { name: /вход\.\.\./i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /вход\.\.\./i })).toBeDisabled()
    })
  })

  describe('Navigation Integration', () => {
    it('should show different navigation for authenticated users', () => {
      // Неавторизованный пользователь
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          isAuthenticated: false,
          user: null,
          signOut: vi.fn(),
        }),
      }))

      const { rerender } = renderComponent(<Navigation />)

      expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /панель/i })).not.toBeInTheDocument()

      // Авторизованный пользователь
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
            accessToken: 'token',
            refreshToken: 'refresh',
          },
          signOut: vi.fn(),
        }),
      }))

      rerender(<Navigation />)

      expect(screen.queryByRole('link', { name: /войти/i })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /панель/i })).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should handle logout from navigation', async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined)
      
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
            accessToken: 'token',
            refreshToken: 'refresh',
          },
          signOut: mockSignOut,
        }),
      }))

      const { user } = renderComponent(<Navigation />)

      // Находим и кликаем по кнопке выхода (в UserInfo компоненте)
      const userButton = screen.getByText('Test User')
      await user.click(userButton)

      // Ищем кнопку выхода в выпадающем меню
      const logoutButton = screen.getByRole('button', { name: /выйти/i })
      await user.click(logoutButton)

      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('Role-based Access', () => {
    it('should show admin links for admin users', () => {
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            accessToken: 'token',
            refreshToken: 'refresh',
          },
          signOut: vi.fn(),
        }),
      }))

      renderComponent(<Navigation />)

      expect(screen.getByRole('link', { name: /управление/i })).toBeInTheDocument()
    })

    it('should not show admin links for regular users', () => {
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Regular User',
            email: 'user@example.com',
            role: 'user',
            accessToken: 'token',
            refreshToken: 'refresh',
          },
          signOut: vi.fn(),
        }),
      }))

      renderComponent(<Navigation />)

      expect(screen.queryByRole('link', { name: /управление/i })).not.toBeInTheDocument()
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate email format in real-time', async () => {
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: vi.fn(),
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      
      // Вводим невалидный email
      await formTestHelpers.fillInput(user, emailInput, 'invalid-email')
      await user.tab() // Убираем фокус для триггера валидации

      // Проверяем появление ошибки валидации
      await waitFor(() => {
        expect(screen.getByText(/некорректный email/i)).toBeInTheDocument()
      })

      // Исправляем email
      await formTestHelpers.fillInput(user, emailInput, 'valid@example.com')
      await user.tab()

      // Проверяем, что ошибка исчезла
      await waitFor(() => {
        expect(screen.queryByText(/некорректный email/i)).not.toBeInTheDocument()
      })
    })

    it('should disable submit button for invalid form', async () => {
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: vi.fn(),
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      const { user } = renderComponent(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /войти/i })
      
      // Изначально кнопка должна быть отключена
      expect(submitButton).toBeDisabled()

      // Заполняем только email
      const emailInput = screen.getByLabelText(/email/i)
      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')

      // Кнопка все еще должна быть отключена
      expect(submitButton).toBeDisabled()

      // Заполняем пароль
      const passwordInput = screen.getByLabelText(/пароль/i)
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      // Теперь кнопка должна быть активна
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation through login form', async () => {
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: vi.fn(),
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      const { user } = renderComponent(<LoginForm />)

      // Проверяем порядок табуляции
      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/пароль/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /войти/i })).toHaveFocus()
    })

    it('should announce form errors to screen readers', async () => {
      vi.doMock('@/contexts/AuthContext', () => ({
        useAuthContext: () => ({
          signIn: vi.fn(),
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      }))

      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await formTestHelpers.fillInput(user, emailInput, 'invalid')
      await user.tab()

      await waitFor(() => {
        const errorMessage = screen.getByText(/некорректный email/i)
        expect(errorMessage).toBeInTheDocument()
        // Проверяем, что ошибка имеет правильные ARIA атрибуты
        expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument()
      })
    })
  })
})