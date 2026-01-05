import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/contexts/AuthContext'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuthContext()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-lg">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-primary text-xl">⚡</span>
                  <span className="font-bold">Modern Stack</span>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={closeMenu}
                  aria-label="Close menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* User info */}
              {isAuthenticated && user && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  <Link
                    to="/"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={closeMenu}
                  >
                    Главная
                  </Link>
                  <Link
                    to="/about"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={closeMenu}
                  >
                    О проекте
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={closeMenu}
                      >
                        Панель управления
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={closeMenu}
                      >
                        Профиль
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={closeMenu}
                      >
                        Настройки
                      </Link>
                    </>
                  )}
                </div>
              </nav>

              {/* Actions */}
              <div className="p-4 border-t border-border">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      signOut()
                      closeMenu()
                    }}
                  >
                    Выйти
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={closeMenu} className="block">
                      <Button variant="outline" className="w-full">
                        Войти
                      </Button>
                    </Link>
                    <Link to="/login" onClick={closeMenu} className="block">
                      <Button className="w-full">
                        Регистрация
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
