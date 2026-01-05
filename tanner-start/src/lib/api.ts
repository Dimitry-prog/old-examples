import ky, { type KyInstance, type Options } from 'ky'
import type { AuthUser } from '@/types'
import { 
  authInterceptor, 
  loggingInterceptor, 
  errorInterceptor, 
  responseInterceptor,
  retryInterceptor,
  timeoutConfig 
} from './apiInterceptors'

/**
 * Базовый URL для API
 * В реальном приложении это будет из переменных окружения
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Создание экземпляра Ky с базовой конфигурацией
 */
const createApiClient = (): KyInstance => {
  return ky.create({
    prefixUrl: API_BASE_URL,
    timeout: timeoutConfig.default,
    retry: retryInterceptor,
    hooks: {
      beforeRequest: [
        authInterceptor,
        ...(import.meta.env.DEV ? [loggingInterceptor] : []),
      ],
      beforeError: [errorInterceptor],
      afterResponse: [responseInterceptor],
    },
  })
}

// Создаем экземпляр API клиента
export const apiClient = createApiClient()

/**
 * Утилиты для работы с API
 */
export const api = {
  /**
   * GET запрос
   */
  get: <T>(url: string, options?: Options): Promise<T> => {
    return apiClient.get(url, options).json<T>()
  },

  /**
   * POST запрос
   */
  post: <T>(url: string, data?: unknown, options?: Options): Promise<T> => {
    return apiClient.post(url, { json: data, ...options }).json<T>()
  },

  /**
   * PUT запрос
   */
  put: <T>(url: string, data?: unknown, options?: Options): Promise<T> => {
    return apiClient.put(url, { json: data, ...options }).json<T>()
  },

  /**
   * PATCH запрос
   */
  patch: <T>(url: string, data?: unknown, options?: Options): Promise<T> => {
    return apiClient.patch(url, { json: data, ...options }).json<T>()
  },

  /**
   * DELETE запрос
   */
  delete: <T>(url: string, options?: Options): Promise<T> => {
    return apiClient.delete(url, options).json<T>()
  },

  /**
   * Загрузка файла
   */
  upload: <T>(url: string, formData: FormData, options?: Options): Promise<T> => {
    return apiClient.post(url, { body: formData, ...options }).json<T>()
  },

  /**
   * Скачивание файла
   */
  download: (url: string, options?: Options): Promise<Blob> => {
    return apiClient.get(url, options).blob()
  },

  /**
   * Получение текста
   */
  text: (url: string, options?: Options): Promise<string> => {
    return apiClient.get(url, options).text()
  },
}

import { z } from 'zod'
import { 
  loginSchema, 
  userSchema, 
  refreshTokenSchema, 
  tokenResponseSchema,
  usersListParamsSchema,
  usersListResponseSchema,
  createUserSchema,
  updateUserSchema
} from './schemas'
import { validationUtils, createApiValidator } from './validation'

/**
 * API методы для аутентификации
 */
export const authApi = {
  /**
   * Вход в систему
   */
  login: async (credentials: { email: string; password: string }): Promise<AuthUser> => {
    try {
      // Валидируем входные данные
      const validatedCredentials = validationUtils.validate(loginSchema, credentials)
      if (!validatedCredentials.success) {
        throw new Error(`Ошибка валидации: ${validatedCredentials.formattedError.message}`)
      }

      // В реальном приложении это будет настоящий API запрос
      // const response = await api.post<AuthUser>('auth/login', validatedCredentials.data)
      // return validationUtils.validate(userSchema, response).data
      
      // Пока что возвращаем мок данные с симуляцией запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResponse = {
        id: '1',
        email: validatedCredentials.data.email,
        name: 'John Doe',
        avatar: undefined,
        role: 'user' as const,
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(userSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Login API error:', error)
      throw error
    }
  },

  /**
   * Выход из системы
   */
  logout: async (): Promise<void> => {
    try {
      // В реальном приложении:
      // return api.post<void>('auth/logout')
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Logout API error:', error)
      throw error
    }
  },

  /**
   * Обновление токена
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      // Валидируем входные данные
      const validatedInput = validationUtils.validate(refreshTokenSchema, { refreshToken })
      if (!validatedInput.success) {
        throw new Error(`Ошибка валидации: ${validatedInput.formattedError.message}`)
      }

      // В реальном приложении:
      // const response = await api.post<TokenResponse>('auth/refresh', validatedInput.data)
      // return validationUtils.validate(tokenResponseSchema, response).data
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockResponse = {
        accessToken: 'new-access-token-' + Date.now(),
        refreshToken: 'new-refresh-token-' + Date.now(),
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(tokenResponseSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Refresh token API error:', error)
      throw error
    }
  },

  /**
   * Получение профиля пользователя
   */
  getProfile: async (): Promise<AuthUser> => {
    try {
      // В реальном приложении:
      // const response = await api.get<AuthUser>('auth/profile')
      // return validationUtils.validate(userSchema, response).data
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockResponse = {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        avatar: undefined,
        role: 'user' as const,
        accessToken: 'current-access-token',
        refreshToken: 'current-refresh-token',
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(userSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Get profile API error:', error)
      throw error
    }
  },
}

/**
 * API методы для пользователей (пример)
 */
export const usersApi = {
  /**
   * Получение списка пользователей
   */
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      // Валидируем параметры запроса
      if (params) {
        const validatedParams = validationUtils.validate(usersListParamsSchema, params)
        if (!validatedParams.success) {
          throw new Error(`Ошибка валидации параметров: ${validatedParams.formattedError.message}`)
        }
        params = validatedParams.data
      }

      // В реальном приложении:
      // const searchParams = new URLSearchParams()
      // if (params?.page) searchParams.set('page', params.page.toString())
      // if (params?.limit) searchParams.set('limit', params.limit.toString())
      // if (params?.search) searchParams.set('search', params.search)
      // const response = await api.get<UsersListResponse>(`users?${searchParams}`)
      // return validationUtils.validate(usersListResponseSchema, response).data
      
      // Симуляция запроса с моковыми данными
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockUsers: AuthUser[] = Array.from({ length: params?.limit || 10 }, (_, i) => ({
        id: `user-${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
        role: (i === 0 ? 'admin' : i === 1 ? 'moderator' : 'user') as const,
        accessToken: `token-${i + 1}`,
        refreshToken: `refresh-${i + 1}`,
      }))
      
      const mockResponse = {
        users: mockUsers,
        total: 50,
        page: params?.page || 1,
        limit: params?.limit || 10,
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(usersListResponseSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Get users API error:', error)
      throw error
    }
  },

  /**
   * Получение пользователя по ID
   */
  getUser: async (id: string): Promise<AuthUser> => {
    try {
      // Валидируем ID
      const validatedId = validationUtils.validate(z.string().min(1), id)
      if (!validatedId.success) {
        throw new Error(`Некорректный ID пользователя: ${validatedId.formattedError.message}`)
      }

      // В реальном приложении:
      // const response = await api.get<AuthUser>(`users/${validatedId.data}`)
      // return validationUtils.validate(userSchema, response).data
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const mockResponse = {
        id: validatedId.data,
        email: `user-${validatedId.data}@example.com`,
        name: `User ${validatedId.data}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${validatedId.data}`,
        role: 'user' as const,
        accessToken: `token-${validatedId.data}`,
        refreshToken: `refresh-${validatedId.data}`,
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(userSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Get user API error:', error)
      throw error
    }
  },

  /**
   * Создание пользователя
   */
  createUser: async (userData: Omit<AuthUser, 'id' | 'accessToken' | 'refreshToken'>): Promise<AuthUser> => {
    try {
      // Валидируем данные пользователя
      const validatedUserData = validationUtils.validate(createUserSchema, userData)
      if (!validatedUserData.success) {
        throw new Error(`Ошибка валидации данных: ${validatedUserData.formattedError.message}`)
      }

      // В реальном приложении:
      // const response = await api.post<AuthUser>('users', validatedUserData.data)
      // return validationUtils.validate(userSchema, response).data
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const mockResponse = {
        ...validatedUserData.data,
        id: `user-${Date.now()}`,
        accessToken: `token-${Date.now()}`,
        refreshToken: `refresh-${Date.now()}`,
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(userSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Create user API error:', error)
      throw error
    }
  },

  /**
   * Обновление пользователя
   */
  updateUser: async (id: string, userData: Partial<AuthUser>): Promise<AuthUser> => {
    try {
      // Валидируем ID
      const validatedId = validationUtils.validate(z.string().min(1), id)
      if (!validatedId.success) {
        throw new Error(`Некорректный ID пользователя: ${validatedId.formattedError.message}`)
      }

      // Валидируем данные для обновления
      const validatedUserData = validationUtils.validate(updateUserSchema, userData)
      if (!validatedUserData.success) {
        throw new Error(`Ошибка валидации данных: ${validatedUserData.formattedError.message}`)
      }

      // В реальном приложении:
      // const response = await api.patch<AuthUser>(`users/${validatedId.data}`, validatedUserData.data)
      // return validationUtils.validate(userSchema, response).data
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Получаем текущие данные пользователя и обновляем их
      const currentUser = await usersApi.getUser(validatedId.data)
      const mockResponse = {
        ...currentUser,
        ...validatedUserData.data,
        id: validatedId.data, // ID не должен изменяться
      }

      // Валидируем ответ
      const validatedResponse = validationUtils.validate(userSchema, mockResponse)
      if (!validatedResponse.success) {
        throw new Error(`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`)
      }

      return validatedResponse.data
    } catch (error) {
      console.error('Update user API error:', error)
      throw error
    }
  },

  /**
   * Удаление пользователя
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      // Валидируем ID
      const validatedId = validationUtils.validate(z.string().min(1), id)
      if (!validatedId.success) {
        throw new Error(`Некорректный ID пользователя: ${validatedId.formattedError.message}`)
      }

      // В реальном приложении:
      // return api.delete<void>(`users/${validatedId.data}`)
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 600))
    } catch (error) {
      console.error('Delete user API error:', error)
      throw error
    }
  },
}

/**
 * Типы для обработки ошибок API
 */
export interface ApiError extends Error {
  status?: number
  data?: any
}

/**
 * Утилиты для обработки ошибок API
 */
export const apiErrorUtils = {
  /**
   * Проверка, является ли ошибка API ошибкой
   */
  isApiError: (error: unknown): error is ApiError => {
    return error instanceof Error && 'status' in error
  },

  /**
   * Получение сообщения об ошибке
   */
  getErrorMessage: (error: unknown): string => {
    if (apiErrorUtils.isApiError(error)) {
      return error.message || `HTTP ${error.status}`
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'Произошла неизвестная ошибка'
  },

  /**
   * Проверка типа ошибки по статус коду
   */
  isClientError: (error: unknown): boolean => {
    return apiErrorUtils.isApiError(error) && 
           error.status !== undefined && 
           error.status >= 400 && 
           error.status < 500
  },

  isServerError: (error: unknown): boolean => {
    return apiErrorUtils.isApiError(error) && 
           error.status !== undefined && 
           error.status >= 500
  },

  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && 
           (error.message.includes('fetch') || 
            error.message.includes('network') ||
            error.message.includes('NetworkError'))
  },

  /**
   * Форматирование ошибки для отображения пользователю
   */
  formatUserError: (error: unknown): string => {
    if (apiErrorUtils.isNetworkError(error)) {
      return 'Проблемы с подключением к серверу'
    }
    
    if (apiErrorUtils.isApiError(error)) {
      switch (error.status) {
        case 400:
          return 'Неверные данные запроса'
        case 401:
          return 'Необходима авторизация'
        case 403:
          return 'Недостаточно прав доступа'
        case 404:
          return 'Ресурс не найден'
        case 409:
          return 'Конфликт данных'
        case 422:
          return 'Ошибка валидации данных'
        case 429:
          return 'Слишком много запросов, попробуйте позже'
        case 500:
          return 'Внутренняя ошибка сервера'
        case 502:
          return 'Сервер временно недоступен'
        case 503:
          return 'Сервис временно недоступен'
        default:
          return error.message || 'Произошла ошибка'
      }
    }
    
    return apiErrorUtils.getErrorMessage(error)
  },
}

/**
 * Хук для создания API клиента с кастомными настройками
 */
export const createCustomApiClient = (options: {
  baseUrl?: string
  timeout?: number
  retries?: number
  headers?: Record<string, string>
} = {}) => {
  return ky.create({
    prefixUrl: options.baseUrl || API_BASE_URL,
    timeout: options.timeout || 30000,
    retry: options.retries || 3,
    headers: options.headers,
    hooks: {
      beforeRequest: [
        (request) => {
          const token = getAuthToken()
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
        },
      ],
    },
  })
}

/**
 * Утилита для создания типобезопасных API методов
 */
export const createApiMethods = <T extends Record<string, any>>(
  endpoints: T,
  client: KyInstance = apiClient
) => {
  const methods = {} as any
  
  Object.entries(endpoints).forEach(([key, config]) => {
    methods[key] = async (params?: any) => {
      const { method = 'GET', url, transform } = config
      
      let finalUrl = url
      if (typeof url === 'function') {
        finalUrl = url(params)
      }
      
      let response
      switch (method.toUpperCase()) {
        case 'GET':
          response = await client.get(finalUrl, params?.options).json()
          break
        case 'POST':
          response = await client.post(finalUrl, { json: params?.data, ...params?.options }).json()
          break
        case 'PUT':
          response = await client.put(finalUrl, { json: params?.data, ...params?.options }).json()
          break
        case 'PATCH':
          response = await client.patch(finalUrl, { json: params?.data, ...params?.options }).json()
          break
        case 'DELETE':
          response = await client.delete(finalUrl, params?.options).json()
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
      
      return transform ? transform(response) : response
    }
  })
  
  return methods
}