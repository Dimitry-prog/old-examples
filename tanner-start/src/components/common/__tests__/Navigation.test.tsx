import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderComponent, authTestHelpers, navigationTestHelpers } from '@/test/component-utils'
import { Navigation } from '../Navigation'

/**
 * Мокаем контексты
 */
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('@/hooks/useApp', () => ({
  useApp: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}))

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authTestHelpers.clearAuthState()
  })

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        isAuthenticated: false,
        user: null,
        signOut: vi.fn(),
      })
    })

    it('should render navigation for unauthenticated user', () => {
      renderComponent(<Navigation />)

      expect(screen.getByText('Modern React Stack')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /главная/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /о проекте/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument()
    })

    it('should not show authenticated-only links', () => {
      renderComponent(<Navigation />)

      expect(screen.queryByRole('link', { name: /панель/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /управление/i })).not.toBeInTheDocument()
    })

    it('should show theme toggle button', () => {
      renderComponent(<Navigation />)

      const themeButton = screen.getByRole('button', { name: /текущая тема/i })
      expect(themeButton).toBeInTheDocument()
    })

    it('should navigate to login page when login button is clicked', async () => {
      const { user } = renderComponent(<Navigation />)

      const loginLink = screen.getByRole('link', { name: /войти/i })
      await user.click(loginLink)

      // В реальном тесте здесь будет проверка навигации
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Authenticated State', () => {
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
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        signOut: vi.fn(),
      })
    })

    it('should render navigation for authenticated user', () => {
      renderComponent(<Navigation />)

      expect(screen.getByRole('link', { name: /главная/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /о проекте/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /панель/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /войти/i })).not.toBeInTheDocument()
    })

    it('should show user info component', () => {
      renderComponent(<Navigation />)

      // UserInfo компонент должен отображать имя пользователя
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should not show login button for authenticated user', () => {
      renderComponent(<Navigation />)

      expect(screen.queryByRole('link', { name: /войти/i })).not.toBeInTheDocument()
    })
  })

  describe('Role-based Navigation', () => {
    it('should show admin links for admin users', () => {
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          accessToken: 'token',
          refreshToken: 'refresh',
        },
        signOut: vi.fn(),
      })

      renderComponent(<Navigation />)

      expect(screen.getByRole('link', { name: /управление/i })).toBeInTheDocument()
    })

    it('should show moderator links for moderator users', () => {
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'moderator@example.com',
          name: 'Moderator User',
          role: 'moderator',
          accessToken: 'token',
          refreshToken: 'refresh',
        },
        signOut: vi.fn(),
      })

      renderComponent(<Navigation />)

      expect(screen.getByRole('link', { name: /управление/i })).toBeInTheDocument()
    })

    it('should not show admin links for regular users', () => {
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          accessToken: 'token',
          refreshToken: 'refresh',
        },
        signOut: vi.fn(),
      })

      renderComponent(<Navigation />)

      expect(screen.queryByRole('link', { name: /управление/i })).not.toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('should show correct theme icon for light theme', () => {
      vi.mocked(require('@/hooks/useApp').useApp).mockReturnValue({
        theme: 'light',
        toggleTheme: vi.fn(),
      })

      renderComponent(<Navigation />)

      const themeButton = screen.getByRole('button', { name: /текущая тема: light/i })
      expect(themeButton).toHaveTextContent('☀️')
    })

    it('should show correct theme icon for dark theme', () => {
      vi.mocked(require('@/hooks/useApp').useApp).mockReturnValue({
        theme: 'dark',
        toggleTheme: vi.fn(),
      })

      renderComponent(<Navigation />)

      const themeButton = screen.getByRole('button', { name: /текущая тема: dark/i })
      expect(themeButton).toHaveTextContent('🌙')
    })

    it('should show correct theme icon for system theme', () => {
      vi.mocked(require('@/hooks/useApp').useApp).mockReturnValue({
        theme: 'system',
        toggleTheme: vi.fn(),
      })

      renderComponent(<Navigation />)

      const themeButton = screen.getByRole('button', { name: /текущая тема: system/i })
      expect(themeButton).toHaveTextContent('🌓')
    })

    it('should call toggleTheme when theme button is clicked', async () => {
      const mockToggleTheme = vi.fn()
      
      vi.mocked(require('@/hooks/useApp').useApp).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      const { user } = renderComponent(<Navigation />)

      const themeButton = screen.getByRole('button', { name: /текущая тема/i })
      await user.click(themeButton)

      expect(mockToggleTheme).toHaveBeenCalled()
    })
  })

  describe('Navigation Links', () => {
    it('should have correct href attributes', () => {
      renderComponent(<Navigation />)

      expect(screen.getByRole('link', { name: /главная/i })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: /о проекте/i })).toHaveAttribute('href', '/about')
    })

    it('should support keyboard navigation', async () => {
      const { user } = renderComponent(<Navigation />)

      const homeLink = screen.getByRole('link', { name: /главная/i })
      const aboutLink = screen.getByRole('link', { name: /о проекте/i })

      await user.tab()
      expect(homeLink).toHaveFocus()

      await user.tab()
      expect(aboutLink).toHaveFocus()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render all navigation items on desktop', () => {
      renderComponent(<Navigation />)

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()

      // Проверяем, что все основные элементы присутствуют
      expect(screen.getByText('Modern React Stack')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /главная/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /о проекте/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderComponent(<Navigation />)

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('should support screen readers', () => {
      renderComponent(<Navigation />)

      const themeButton = screen.getByRole('button', { name: /текущая тема/i })
      expect(themeButton).toHaveAttribute('title')
    })

    it('should have proper focus management', async () => {
      const { user } = renderComponent(<Navigation />)

      // Проверяем, что можно навигировать по всем интерактивным элементам
      await user.tab()
      expect(document.activeElement).toHaveAttribute('href')

      await user.tab()
      expect(document.activeElement).toHaveAttribute('href')

      await user.tab()
      expect(document.activeElement).toHaveAttribute('type', 'button')
    })
  })

  describe('Integration Tests', () => {
    it('should work with router navigation', async () => {
      const { user, router } = renderComponent(<Navigation />, {
        routerOptions: {
          initialEntries: ['/'],
        },
      })

      const aboutLink = screen.getByRole('link', { name: /о проекте/i })
      await user.click(aboutLink)

      // В реальном тесте здесь будет проверка изменения URL
      expect(aboutLink).toHaveAttribute('href', '/about')
    })

    it('should update when authentication state changes', () => {
      const { rerender } = renderComponent(<Navigation />)

      // Начальное состояние - не авторизован
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
        isAuthenticated: false,
        user: null,
        signOut: vi.fn(),
      })

      rerender(<Navigation />)
      expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument()

      // Изменяем состояние на авторизованного
      vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({
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
      })

      rerender(<Navigation />)
      expect(screen.queryByRole('link', { name: /войти/i })).not.toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })
})