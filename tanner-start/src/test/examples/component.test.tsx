import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../utils'
import { createTestUser, createTestAuthState } from '../factories'
import { LoginForm } from '@/components/auth/LoginForm'

/**
 * Пример тестирования React компонента
 */
describe('LoginForm', () => {
  const mockUser = createTestUser()
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /войти/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email обязателен/i)).toBeInTheDocument()
      expect(screen.getByText(/пароль обязателен/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /войти/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockAuthState = createTestAuthState({ user: null, isAuthenticated: false })
    
    renderWithProviders(<LoginForm />, {
      initialAuth: mockAuthState,
    })
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })
    
    fireEvent.change(emailInput, { target: { value: mockUser.email } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('shows remember me checkbox', () => {
    renderWithProviders(<LoginForm />)
    
    const rememberCheckbox = screen.getByLabelText(/запомнить меня/i)
    expect(rememberCheckbox).toBeInTheDocument()
    expect(rememberCheckbox).not.toBeChecked()
  })

  it('toggles password visibility', () => {
    renderWithProviders(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/пароль/i)
    const toggleButton = screen.getByRole('button', { name: /показать пароль/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows demo credentials', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByText(/демо данные для входа/i)).toBeInTheDocument()
    expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/moderator@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', () => {
    renderWithProviders(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /войти/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when form is valid', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const submitButton = screen.getByRole('button', { name: /войти/i })
    
    fireEvent.change(emailInput, { target: { value: mockUser.email } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})

/**
 * Пример тестирования компонента с провайдерами
 */
describe('LoginForm with Auth Context', () => {
  it('shows loading state during authentication', async () => {
    const mockAuthState = createTestAuthState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: true 
    })
    
    renderWithProviders(<LoginForm />, {
      initialAuth: mockAuthState,
    })
    
    const submitButton = screen.getByRole('button', { name: /вход.../i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('shows error message when authentication fails', async () => {
    const mockAuthState = createTestAuthState({ 
      user: null, 
      isAuthenticated: false, 
      error: 'Invalid credentials' 
    })
    
    renderWithProviders(<LoginForm />, {
      initialAuth: mockAuthState,
    })
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('redirects when user is already authenticated', () => {
    const mockAuthState = createTestAuthState({ 
      user: createTestUser(), 
      isAuthenticated: true 
    })
    
    renderWithProviders(<LoginForm />, {
      initialAuth: mockAuthState,
    })
    
    // В реальном приложении здесь был бы редирект
    // Для теста проверяем, что форма не отображается
    expect(screen.queryByRole('button', { name: /войти/i })).not.toBeInTheDocument()
  })
})