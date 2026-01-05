import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

interface CenteredLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showBackLink?: boolean
  backLinkTo?: string
  backLinkText?: string
}

/**
 * Центрированный layout для форм и специальных страниц
 * Используется для страниц логина, регистрации, ошибок и т.д.
 */
export function CenteredLayout({
  children,
  title,
  subtitle,
  showBackLink = true,
  backLinkTo = '/',
  backLinkText = 'На главную',
}: CenteredLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex items-center space-x-2">
        <span className="text-primary text-3xl">⚡</span>
        <span className="text-2xl font-bold">Modern Stack</span>
      </div>

      {/* Content card */}
      <div className="w-full max-w-md">
        {(title || subtitle) && (
          <div className="mb-6 text-center">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          {children}
        </div>

        {showBackLink && (
          <div className="mt-6 text-center">
            <Link
              to={backLinkTo}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {backLinkText}
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Modern Stack. Все права защищены.</p>
      </div>
    </div>
  )
}
