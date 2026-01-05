// Базовые типы для приложения

export type User = {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'moderator'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ApiResponse<T> = {
  data: T
  message: string
  success: boolean
  timestamp: Date
}

export type ApiError = {
  message: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
}

export type AuthUser = {
  id: string
  email: string
  name: string
  avatar?: string
  role: User['role']
  accessToken: string
  refreshToken: string
}

export type Theme = 'light' | 'dark' | 'system'

export type Language = 'ru' | 'en'

export type AppConfig = {
  theme: Theme
  language: Language
  apiUrl: string
  version: string
}

// Реэкспорт всех типов
export * from './api'
export * from './components'
export * from './forms'
export * from './permissions'
export * from './router'
export * from './routes'
