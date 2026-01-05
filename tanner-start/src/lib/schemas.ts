import { z } from 'zod'

/**
 * Базовые схемы валидации
 */

// Схема для ID
export const idSchema = z.string().min(1, 'ID не может быть пустым')

// Схема для email
export const emailSchema = z
  .string()
  .email('Некорректный email адрес')
  .min(1, 'Email обязателен')

// Схема для пароля
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')

// Схема для имени пользователя
export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя не может быть длиннее 50 символов')
  .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя может содержать только буквы и пробелы')

// Схема для роли пользователя
export const userRoleSchema = z.enum(['admin', 'moderator', 'user'], {
  errorMap: () => ({ message: 'Некорректная роль пользователя' })
})

// Схема для темы приложения
export const themeSchema = z.enum(['light', 'dark', 'system'], {
  errorMap: () => ({ message: 'Некорректная тема' })
})

// Схема для языка
export const languageSchema = z.enum(['ru', 'en'], {
  errorMap: () => ({ message: 'Некорректный язык' })
})

/**
 * Схемы для пользователя
 */

// Базовая схема пользователя
export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  name: nameSchema,
  avatar: z.string().url('Некорректный URL аватара').optional(),
  role: userRoleSchema,
  accessToken: z.string().min(1, 'Access token обязателен'),
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
})

// Схема для создания пользователя
export const createUserSchema = userSchema.omit({
  id: true,
  accessToken: true,
  refreshToken: true,
})

// Схема для обновления пользователя
export const updateUserSchema = userSchema.partial().omit({
  id: true,
  accessToken: true,
  refreshToken: true,
})

// Схема для профиля пользователя (без токенов)
export const userProfileSchema = userSchema.omit({
  accessToken: true,
  refreshToken: true,
})

/**
 * Схемы для аутентификации
 */

// Схема для входа в систему
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
})

// Схема для регистрации
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  confirmPassword: z.string().min(1, 'Подтверждение пароля обязательно'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

// Схема для сброса пароля
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Схема для восстановления пароля
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Подтверждение пароля обязательно'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

// Схема для обновления токена
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
})

/**
 * Схемы для API ответов
 */

// Схема для успешного ответа аутентификации
export const authResponseSchema = z.object({
  user: userSchema,
  message: z.string().optional(),
})

// Схема для ответа с токенами
export const tokenResponseSchema = z.object({
  accessToken: z.string().min(1, 'Access token обязателен'),
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
})

// Схема для списка пользователей
export const usersListResponseSchema = z.object({
  users: z.array(userProfileSchema),
  total: z.number().min(0, 'Общее количество не может быть отрицательным'),
  page: z.number().min(1, 'Номер страницы должен быть больше 0'),
  limit: z.number().min(1, 'Лимит должен быть больше 0'),
})

// Схема для параметров запроса списка пользователей
export const usersListParamsSchema = z.object({
  page: z.number().min(1, 'Номер страницы должен быть больше 0').optional(),
  limit: z.number().min(1, 'Лимит должен быть больше 0').max(100, 'Лимит не может быть больше 100').optional(),
  search: z.string().optional(),
  role: userRoleSchema.optional(),
})

/**
 * Схемы для настроек приложения
 */

// Схема для настроек пользователя
export const userSettingsSchema = z.object({
  theme: themeSchema,
  language: languageSchema,
  notifications: z.boolean(),
  emailNotifications: z.boolean(),
})

// Схема для обновления настроек
export const updateSettingsSchema = userSettingsSchema.partial()

/**
 * Схемы для файлов
 */

// Схема для файла
export const fileSchema = z.object({
  id: idSchema,
  name: z.string().min(1, 'Имя файла обязательно'),
  size: z.number().min(0, 'Размер файла не может быть отрицательным'),
  type: z.string().min(1, 'Тип файла обязателен'),
  url: z.string().url('Некорректный URL файла'),
  uploadedAt: z.string().datetime('Некорректная дата загрузки'),
  uploadedBy: idSchema,
})

// Схема для загрузки файла
export const uploadFileSchema = z.object({
  file: z.instanceof(File, { message: 'Файл обязателен' }),
  description: z.string().optional(),
})

/**
 * Схемы для ошибок API
 */

// Схема для ошибки API
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
})

// Схема для ошибок валидации
export const validationErrorSchema = z.object({
  message: z.string(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional(),
  })),
})

/**
 * Типы, выведенные из схем
 */

export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type UserRole = z.infer<typeof userRoleSchema>

export type LoginCredentials = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export type AuthResponse = z.infer<typeof authResponseSchema>
export type TokenResponse = z.infer<typeof tokenResponseSchema>

export type UsersListResponse = z.infer<typeof usersListResponseSchema>
export type UsersListParams = z.infer<typeof usersListParamsSchema>

export type UserSettings = z.infer<typeof userSettingsSchema>
export type UpdateSettings = z.infer<typeof updateSettingsSchema>

export type FileData = z.infer<typeof fileSchema>
export type UploadFileData = z.infer<typeof uploadFileSchema>

export type ApiError = z.infer<typeof apiErrorSchema>
export type ValidationError = z.infer<typeof validationErrorSchema>

export type Theme = z.infer<typeof themeSchema>
export type Language = z.infer<typeof languageSchema>