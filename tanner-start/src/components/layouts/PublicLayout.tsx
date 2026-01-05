import { useAuthContext } from '@/contexts/AuthContext'
import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { MainLayout } from './MainLayout'

interface PublicLayoutProps {
  children: ReactNode
  redirectIfAuthenticated?: boolean
  redirectTo?: string
}

/**
 * Layout для публичных страниц
 * Может перенаправлять аутентифицированных пользователей
 */
export function PublicLayout({
  children,
  redirectIfAuthenticated = false,
  redirectTo = '/dashboard',
}: PublicLayoutProps) {
  const { isAuthenticated } = useAuthContext()

  // Перенаправляем аутентифицированных пользователей (например, со страницы логина)
  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} />
  }

  return <MainLayout>{children}</MainLayout>
}
