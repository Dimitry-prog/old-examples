import { z } from 'zod'
import { api } from './api'
import { validationUtils } from './validation'
import {
  loginSchema,
  registerSchema,
  userSchema,
  usersListParamsSchema,
  usersListResponseSchema,
  createUserSchema,
  updateUserSchema,
  userSettingsSchema,
  updateSettingsSchema,
  type LoginCredentials,
  type RegisterData,
  type User,
  type UsersListParams,
  type UsersListResponse,
  type CreateUser,
  type UpdateUser,
  type UserSettings,
  type UpdateSettings,
} from './schemas'

/**
 * Типизированные API методы с автоматической валидацией
 */

/**
 * Создание типизированного API метода
 */
const createTypedApiMethod = <TRequest, TResponse>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string | ((params: any) => string),
  requestSchema?: z.ZodSchema<TRequest>,
  responseSchema?: z.ZodSchema<TResponse>
) => {
  return async (params?: TRequest & { options?: any }): Promise<TResponse> => {
    try {
      // Валидируем входные данные
      let validatedParams: TRequest | undefined
      if (requestSchema && params) {
        const validation = validationUtils.validate(requestSchema, params)
        if (!validation.success) {
          throw new Error(`Ошибка валидации запроса: ${validation.formattedError.message}`)
        }
        validatedParams = validation.data
      }

      // Определяем URL
      const finalUrl = typeof url === 'function' ? url(params) : url

      // Выполняем запрос
      let response: any
      const options = params?.options || {}

      switch (method) {
        case 'get':
          response = await api.get(finalUrl, options)
          break
        case 'post':
          response = await api.post(finalUrl, validatedParams, options)
          break
        case 'put':
          response = await api.put(finalUrl, validatedParams, options)
          break
        case 'patch':
          response = await api.patch(finalUrl, validatedParams, options)
          break
        case 'delete':
          response = await api.delete(finalUrl, options)
          break
        default:
          throw new Error(`Неподдерживаемый HTTP метод: ${method}`)
      }

      // Валидируем ответ
      if (responseSchema) {
        const validation = validationUtils.validate(responseSchema, response)
        if (!validation.success) {
          console.error('Response validation failed:', validation.formattedError)
          throw new Error(`Ошибка валидации ответа: ${validation.formattedError.message}`)
        }
        return validation.data
      }

      return response
    } catch (error) {
      console.error(`API method ${method.toUpperCase()} ${url} failed:`, error)
      throw error
    }
  }
}

/**
 * Типизированные методы аутентификации
 */
export const typedAuthApi = {
  /**
   * Вход в систему
   */
  login: createTypedApiMethod<LoginCredentials, User>(
    'post',
    'auth/login',
    loginSchema,
    userSchema
  ),

  /**
   * Регистрация
   */
  register: createTypedApiMethod<RegisterData, User>(
    'post',
    'auth/register',
    registerSchema,
    userSchema
  ),

  /**
   * Выход из системы
   */
  logout: createTypedApiMethod<void, void>(
    'post',
    'auth/logout'
  ),

  /**
   * Получение профиля
   */
  getProfile: createTypedApiMethod<void, User>(
    'get',
    'auth/profile',
    undefined,
    userSchema
  ),

  /**
   * Обновление токена
   */
  refreshToken: createTypedApiMethod<{ refreshToken: string }, { accessToken: string; refreshToken: string }>(
    'post',
    'auth/refresh',
    z.object({ refreshToken: z.string() }),
    z.object({ accessToken: z.string(), refreshToken: z.string() })
  ),
}

/**
 * Типизированные методы для пользователей
 */
export const typedUsersApi = {
  /**
   * Получение списка пользователей
   */
  getUsers: createTypedApiMethod<UsersListParams, UsersListResponse>(
    'get',
    'users',
    usersListParamsSchema,
    usersListResponseSchema
  ),

  /**
   * Получение пользователя по ID
   */
  getUser: createTypedApiMethod<{ id: string }, User>(
    'get',
    (params: { id: string }) => `users/${params.id}`,
    z.object({ id: z.string() }),
    userSchema
  ),

  /**
   * Создание пользователя
   */
  createUser: createTypedApiMethod<CreateUser, User>(
    'post',
    'users',
    createUserSchema,
    userSchema
  ),

  /**
   * Обновление пользователя
   */
  updateUser: createTypedApiMethod<{ id: string } & UpdateUser, User>(
    'patch',
    (params: { id: string }) => `users/${params.id}`,
    z.object({ id: z.string() }).merge(updateUserSchema),
    userSchema
  ),

  /**
   * Удаление пользователя
   */
  deleteUser: createTypedApiMethod<{ id: string }, void>(
    'delete',
    (params: { id: string }) => `users/${params.id}`,
    z.object({ id: z.string() })
  ),
}

/**
 * Типизированные методы для настроек
 */
export const typedSettingsApi = {
  /**
   * Получение настроек
   */
  getSettings: createTypedApiMethod<void, UserSettings>(
    'get',
    'settings',
    undefined,
    userSettingsSchema
  ),

  /**
   * Обновление настроек
   */
  updateSettings: createTypedApiMethod<UpdateSettings, UserSettings>(
    'patch',
    'settings',
    updateSettingsSchema,
    userSettingsSchema
  ),

  /**
   * Сброс настроек
   */
  resetSettings: createTypedApiMethod<void, UserSettings>(
    'post',
    'settings/reset',
    undefined,
    userSettingsSchema
  ),
}

/**
 * Объединенный типизированный API
 */
export const typedApi = {
  auth: typedAuthApi,
  users: typedUsersApi,
  settings: typedSettingsApi,
}

/**
 * Хуки для создания кастомных типизированных API методов
 */
export const apiFactory = {
  /**
   * Создание GET метода
   */
  createGetMethod: <TResponse>(
    url: string,
    responseSchema?: z.ZodSchema<TResponse>
  ) => createTypedApiMethod<void, TResponse>('get', url, undefined, responseSchema),

  /**
   * Создание POST метода
   */
  createPostMethod: <TRequest, TResponse>(
    url: string,
    requestSchema?: z.ZodSchema<TRequest>,
    responseSchema?: z.ZodSchema<TResponse>
  ) => createTypedApiMethod<TRequest, TResponse>('post', url, requestSchema, responseSchema),

  /**
   * Создание PATCH метода
   */
  createPatchMethod: <TRequest, TResponse>(
    url: string,
    requestSchema?: z.ZodSchema<TRequest>,
    responseSchema?: z.ZodSchema<TResponse>
  ) => createTypedApiMethod<TRequest, TResponse>('patch', url, requestSchema, responseSchema),

  /**
   * Создание DELETE метода
   */
  createDeleteMethod: <TRequest, TResponse>(
    url: string,
    requestSchema?: z.ZodSchema<TRequest>,
    responseSchema?: z.ZodSchema<TResponse>
  ) => createTypedApiMethod<TRequest, TResponse>('delete', url, requestSchema, responseSchema),
}

/**
 * Утилиты для работы с типизированным API
 */
export const typedApiUtils = {
  /**
   * Создание batch запросов
   */
  createBatch: <T extends Record<string, () => Promise<any>>>(
    requests: T
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> => {
    const promises = Object.entries(requests).map(async ([key, request]) => {
      try {
        const result = await request()
        return [key, result]
      } catch (error) {
        console.error(`Batch request ${key} failed:`, error)
        throw error
      }
    })

    return Promise.all(promises).then((results) => {
      return results.reduce((acc, [key, result]) => {
        acc[key as keyof T] = result
        return acc
      }, {} as any)
    })
  },

  /**
   * Создание параллельных запросов с обработкой ошибок
   */
  createParallel: async <T extends readonly (() => Promise<any>)[]>(
    requests: T
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> | Error }> => {
    const results = await Promise.allSettled(requests.map(request => request()))
    
    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return result.reason
      }
    }) as any
  },

  /**
   * Создание запроса с retry логикой
   */
  withRetry: <T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      let lastError: Error

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await request()
          resolve(result)
          return
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          
          if (attempt === maxRetries) {
            reject(lastError)
            return
          }

          // Exponential backoff
          const waitTime = delay * Math.pow(2, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    })
  },
}