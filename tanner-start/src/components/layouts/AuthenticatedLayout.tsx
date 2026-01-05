import { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import { RoleBasedRender } from '@/components/guards/RouteGuard'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const location = useLocation()
  const { user } = useAuthContext()

  const sidebarItems = [
    {
      to: '/dashboard',
      label: 'Панель управления',
      icon: '📊',
    },
    {
      to: '/profile',
      label: 'Профиль',
      icon: '👤',
    },
    {
      to: '/settings',
      label: 'Настройки',
      icon: '⚙️',
    },
  ]

  const adminItems = [
    {
      to: '/admin',
      label: 'Администрирование',
      icon: '🛠️',
      requiredRole: 'moderator' as const,
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium">{user?.name || 'Пользователь'}</p>
              <p className="text-sm text-muted-foreground">{user?.role || 'user'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {adminItems.map((item) => (
              <RoleBasedRender key={item.to} requiredRole={item.requiredRole}>
                <Link
                  to={item.to}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </RoleBasedRender>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}