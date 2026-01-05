import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { RoleBasedRender, useRoleGuard } from '@/components/guards/RouteGuard'

/**
 * Компонент для отображения информации о пользователе
 */
export function UserInfo() {
  const { user, profile, isProfileLoading, signOut } = useAuthContext()
  const { isAdmin, isModerator } = useRoleGuard()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) {
    return null
  }

  const displayUser = profile || user
  const isLoading = isProfileLoading

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        {displayUser.avatar ? (
          <img
            src={displayUser.avatar}
            alt={displayUser.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {displayUser.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="text-left">
          <div className="text-sm font-medium">{displayUser.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {displayUser.role}
            {isLoading && ' (обновление...)'}
          </div>
        </div>
        
        <svg
          className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              {displayUser.avatar ? (
                <img
                  src={displayUser.avatar}
                  alt={displayUser.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium">
                  {displayUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div>
                <div className="font-medium">{displayUser.name}</div>
                <div className="text-sm text-muted-foreground">{displayUser.email}</div>
                <div className="text-xs text-muted-foreground capitalize flex items-center">
                  {displayUser.role}
                  {isAdmin() && <span className="ml-1 text-red-500">👑</span>}
                  {isModerator() && !isAdmin() && <span className="ml-1 text-blue-500">🛡️</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsMenuOpen(false)
                // Здесь можно добавить навигацию к профилю
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              Профиль
            </button>
            
            <button
              onClick={() => {
                setIsMenuOpen(false)
                // Здесь можно добавить навигацию к настройкам
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              Настройки
            </button>

            <RoleBasedRender requiredRole="moderator">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  // Здесь можно добавить навигацию к панели модератора
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                Панель модератора
              </button>
            </RoleBasedRender>

            <RoleBasedRender requiredRole="admin">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  // Здесь можно добавить навигацию к админ панели
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                Админ панель
              </button>
            </RoleBasedRender>

            <hr className="my-2" />
            
            <button
              onClick={() => {
                setIsMenuOpen(false)
                signOut()
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-red-600"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Компонент для отображения краткой информации о пользователе
 */
export function UserBadge() {
  const { user, profile } = useAuthContext()
  const { isAdmin, isModerator } = useRoleGuard()

  if (!user) {
    return null
  }

  const displayUser = profile || user

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-accent rounded-lg">
      {displayUser.avatar ? (
        <img
          src={displayUser.avatar}
          alt={displayUser.name}
          className="w-6 h-6 rounded-full"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {displayUser.name.charAt(0).toUpperCase()}
        </div>
      )}
      
      <span className="text-sm font-medium">{displayUser.name}</span>
      
      {isAdmin() && <span className="text-xs">👑</span>}
      {isModerator() && !isAdmin() && <span className="text-xs">🛡️</span>}
    </div>
  )
}

/**
 * Компонент для отображения статуса аутентификации
 */
export function AuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>Проверка...</span>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Авторизован как {user.name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-red-600">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span>Не авторизован</span>
    </div>
  )
}

/**
 * Компонент для отображения ролевых бейджей
 */
export function RoleBadge() {
  const { user } = useAuthContext()

  if (!user) {
    return null
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    moderator: 'bg-blue-100 text-blue-800 border-blue-200',
    user: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const roleIcons = {
    admin: '👑',
    moderator: '🛡️',
    user: '👤',
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
      <span className="mr-1">{roleIcons[user.role]}</span>
      {user.role}
    </span>
  )
}