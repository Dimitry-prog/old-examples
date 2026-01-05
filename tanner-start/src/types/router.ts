// Типы для маршрутизации

export type RouteParams = Record<string, string | undefined>

export type SearchParams = Record<string, string | string[] | undefined>

export type RouteContext = {
  user?: AuthUser
  isAuthenticated: boolean
}

export type ProtectedRouteProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredRole?: User['role']
}

export type PublicRouteProps = {
  children: React.ReactNode
  redirectTo?: string
}

// Импорт типов из основного файла
import type { AuthUser, User } from './index'

// Типы для TanStack Router
export type RouterContext = {
  auth: {
    user?: AuthUser
    isAuthenticated: boolean
    login: (user: AuthUser) => void
    logout: () => void
  }
}

export type RouteInfo = {
  id: string
  path: string
  fullPath: string
  title?: string
  description?: string
}
