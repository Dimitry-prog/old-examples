import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderComponent, formTestHelpers } from '@/test/component-utils'
import { LoginForm, CompactLoginForm } from '../LoginForm'

/**
 * Мокаем контекст аутентификации
 */
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    signIn: vi.fn(),
    isLoading: false,
    error: null,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LoginForm Component', () => {
    it('should render login form with all fields', () => {
      renderComponent(<LoginForm />)

      expect(screen.getByRole('heading', { name: /вход в систему/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
    })

    it('should have submit button disabled initially', () => {
      renderComponent(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /войти/i })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when form is valid', async () => {
      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /войти/i })
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should show validation errors for invalid email', async () => {
      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await formTestHelpers.fillInput(user, emailInput, 'invalid-email')
      
      // Убираем фокус с поля для триггера валидации
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/некорректный email/i)).toBeInTheDocument()
      })
    })

    it('should show validation errors for empty password', async () => {
      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await user.click(passwordInput)
      await user.tab() // Убираем фокус без ввода

      await waitFor(() => {
        expect(screen.getByText(/пароль обязателен/i)).toBeInTheDocument()
      })
    })

    it('should call signIn when form is submitted with valid data', async () => {
      const mockSignIn = vi.fn().mockResolvedValue(undefined)
      
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: mockSignIn,
        isLoading: false,
        error: null,
      })

      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)
      const submitButton = screen.getByRole('button', { name: /войти/i })

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should show loading state during submission', async () => {
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000))),
        isLoading: true,
        error: null,
      })

      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /вход\.\.\./i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should display error message when login fails', () => {
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: vi.fn(),
        isLoading: false,
        error: 'Неверные учетные данные',
      })

      renderComponent(<LoginForm />)

      expect(screen.getByText('Неверные учетные данные')).toBeInTheDocument()
    })

    it('should call onSuccess callback after successful login', async () => {
      const mockOnSuccess = vi.fn()
      const mockSignIn = vi.fn().mockResolvedValue(undefined)

      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: mockSignIn,
        isLoading: false,
        error: null,
      })

      const { user } = renderComponent(<LoginForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)
      const submitButton = screen.getByRole('button', { name: /войти/i })

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should have register link', () => {
      renderComponent(<LoginForm />)

      expect(screen.getByText(/нет аккаунта/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument()
    })
  })

  describe('CompactLoginForm Component', () => {
    it('should render compact form without card wrapper', () => {
      renderComponent(<CompactLoginForm />)

      expect(screen.queryByRole('heading', { name: /вход в систему/i })).not.toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
    })

    it('should work with same validation as regular form', async () => {
      const { user } = renderComponent(<CompactLoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await formTestHelpers.fillInput(user, emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/некорректный email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Accessibility', () => {
    it('should have proper labels and ARIA attributes', () => {
      renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(emailInput).toHaveAttribute('placeholder')
      expect(passwordInput).toHaveAttribute('placeholder')
    })

    it('should support keyboard navigation', async () => {
      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)
      const submitButton = screen.getByRole('button', { name: /войти/i })

      // Проверяем порядок табуляции
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should announce errors to screen readers', async () => {
      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await formTestHelpers.fillInput(user, emailInput, 'invalid')
      await user.tab()

      await waitFor(() => {
        const errorMessage = screen.getByText(/некорректный email/i)
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })
  })

  describe('Form Integration', () => {
    it('should work with different authentication states', () => {
      // Тест с загрузкой
      const { rerender } = renderComponent(<LoginForm />)
      
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: vi.fn(),
        isLoading: true,
        error: null,
      })

      rerender(<LoginForm />)
      expect(screen.getByRole('button', { name: /вход\.\.\./i })).toBeDisabled()

      // Тест с ошибкой
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: vi.fn(),
        isLoading: false,
        error: 'Ошибка сети',
      })

      rerender(<LoginForm />)
      expect(screen.getByText('Ошибка сети')).toBeInTheDocument()
    })

    it('should handle form reset after error', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Login failed'))

      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        signIn: mockSignIn,
        isLoading: false,
        error: 'Login failed',
      })

      const { user } = renderComponent(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)

      await formTestHelpers.fillInput(user, emailInput, 'test@example.com')
      await formTestHelpers.fillInput(user, passwordInput, 'password123')

      // Проверяем, что значения сохранились после ошибки
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })
  })
})