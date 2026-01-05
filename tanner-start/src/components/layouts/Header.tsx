import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/contexts/AuthContext'
import { Link } from '@tanstack/react-router'
import { MobileNav } from './MobileNav'

export function Header() {
  const { user, isAuthenticated, signOut } = useAuthContext()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and brand */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <span className="text-primary">⚡</span>
            <span>Modern Stack</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{
                className: 'text-foreground',
              }}
            >
              Главная
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{
                className: 'text-foreground',
              }}
            >
              О проекте
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{
                  className: 'text-foreground',
                }}
              >
                Панель
              </Link>
            )}
          </nav>
        </div>

        {/* User actions - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span>{user?.name}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm">
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile navigation */}
        <MobileNav />
      </div>
    </header>
  )
}
