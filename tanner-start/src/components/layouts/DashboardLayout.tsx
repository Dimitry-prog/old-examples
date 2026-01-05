import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

/**
 * Layout для страниц dashboard
 * Включает заголовок страницы и область для действий
 */
export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      {(title || subtitle || actions) && (
        <div className="border-b border-border bg-background">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-6">{children}</div>
      </div>
    </div>
  )
}
