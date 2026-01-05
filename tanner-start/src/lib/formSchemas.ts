import { z } from 'zod'

/**
 * Базовые схемы валидации для форм
 */

// Схема для email
export const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .email('Некорректный формат email')

// Схема для пароля
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')

// Простая схема для пароля (для демо)
export const simplePasswordSchema = z
  .string()
  .min(1, 'Пароль обязателен')

// Схема для имени
export const nameSchema = z
  .string()
  .min(1, 'Имя обязательно')
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя не должно превышать 50 символов')
  .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя может содержать только буквы и пробелы')

// Схема для телефона
export const phoneSchema = z
  .string()
  .min(1, 'Телефон обязателен')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Некорректный формат телефона')

// Схема для возраста
export const ageSchema = z
  .number()
  .min(18, 'Возраст должен быть не менее 18 лет')
  .max(120, 'Возраст не должен превышать 120 лет')

/**
 * Схемы для форм аутентификации
 */

// Схема для входа
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  remember: z.boolean().optional(),
})

// Схема для регистрации
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Подтверждение пароля обязательно'),
    name: nameSchema,
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Необходимо принять условия использования',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

// Схема для сброса пароля
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Схема для изменения пароля
export const changePasswordSchema = z
  .object({
    currentPassword: simplePasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Подтверждение пароля обязательно'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'Новый пароль должен отличаться от текущего',
    path: ['newPassword'],
  })

/**
 * Схемы для профиля пользователя
 */

// Схема для редактирования профиля
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Биография не должна превышать 500 символов').optional(),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Местоположение не должно превышать 100 символов').optional(),
  birthDate: z.string().optional(),
})

// Схема для настроек уведомлений
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
})

// Схема для настроек приватности
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'friends']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowMessages: z.boolean(),
  allowFriendRequests: z.boolean(),
})

/**
 * Схемы для контактных форм
 */

// Схема для обратной связи
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Тема обязательна').max(100, 'Тема не должна превышать 100 символов'),
  message: z.string().min(1, 'Сообщение обязательно').min(10, 'Сообщение должно содержать минимум 10 символов').max(1000, 'Сообщение не должно превышать 1000 символов'),
  category: z.enum(['general', 'support', 'bug', 'feature']),
})

// Схема для подписки на рассылку
export const subscriptionSchema = z.object({
  email: emailSchema,
  categories: z.array(z.string()).min(1, 'Выберите хотя бы одну категорию'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
})

/**
 * Схемы для многошаговых форм
 */

// Шаг 1: Личная информация
export const personalInfoStepSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
})

// Шаг 2: Адрес
export const addressStepSchema = z.object({
  street: z.string().min(1, 'Улица обязательна'),
  city: z.string().min(1, 'Город обязателен'),
  state: z.string().min(1, 'Регион обязателен'),
  zipCode: z.string().min(1, 'Почтовый индекс обязателен'),
  country: z.string().min(1, 'Страна обязательна'),
})

// Шаг 3: Предпочтения
export const preferencesStepSchema = z.object({
  interests: z.array(z.string()).min(1, 'Выберите хотя бы один интерес'),
  newsletter: z.boolean(),
  notifications: z.boolean(),
})

// Полная схема многошагового онбординга
export const onboardingSchema = personalInfoStepSchema
  .merge(addressStepSchema)
  .merge(preferencesStepSchema)

/**
 * Схемы для динамических форм
 */

// Схема для элемента списка навыков
export const skillSchema = z.object({
  name: z.string().min(1, 'Название навыка обязательно'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number().min(0, 'Опыт не может быть отрицательным').max(50, 'Опыт не может превышать 50 лет'),
})

// Схема для элемента списка образования
export const educationSchema = z.object({
  institution: z.string().min(1, 'Название учебного заведения обязательно'),
  degree: z.string().min(1, 'Степень обязательна'),
  field: z.string().min(1, 'Область обучения обязательна'),
  startYear: z.number().min(1950, 'Год начала не может быть раньше 1950').max(new Date().getFullYear(), 'Год начала не может быть в будущем'),
  endYear: z.number().min(1950, 'Год окончания не может быть раньше 1950').max(new Date().getFullYear() + 10, 'Год окончания слишком далеко в будущем').optional(),
  current: z.boolean(),
})

// Схема для резюме с динамическими списками
export const resumeSchema = z.object({
  personalInfo: personalInfoStepSchema,
  skills: z.array(skillSchema).min(1, 'Добавьте хотя бы один навык'),
  education: z.array(educationSchema).min(1, 'Добавьте хотя бы одно образование'),
  summary: z.string().min(50, 'Краткое описание должно содержать минимум 50 символов').max(500, 'Краткое описание не должно превышать 500 символов'),
})

/**
 * Схемы для условной валидации
 */

// Схема с условной валидацией для опыта работы
export const experienceSchema = z
  .object({
    hasExperience: z.boolean(),
    experience: z.string().optional(),
    yearsOfExperience: z.number().optional(),
  })
  .refine(
    data => {
      if (data.hasExperience) {
        return data.experience && data.experience.length > 0 && data.yearsOfExperience && data.yearsOfExperience > 0
      }
      return true
    },
    {
      message: 'При наличии опыта необходимо указать описание и количество лет',
      path: ['experience'],
    }
  )

// Схема для формы заказа с условной валидацией доставки
export const orderSchema = z
  .object({
    items: z.array(z.object({
      id: z.string(),
      quantity: z.number().min(1, 'Количество должно быть больше 0'),
    })).min(1, 'Добавьте хотя бы один товар'),
    deliveryType: z.enum(['pickup', 'delivery']),
    deliveryAddress: z.string().optional(),
    deliveryDate: z.string().optional(),
    paymentMethod: z.enum(['card', 'cash', 'online']),
    notes: z.string().max(500, 'Комментарий не должен превышать 500 символов').optional(),
  })
  .refine(
    data => {
      if (data.deliveryType === 'delivery') {
        return data.deliveryAddress && data.deliveryAddress.length > 0
      }
      return true
    },
    {
      message: 'При доставке необходимо указать адрес',
      path: ['deliveryAddress'],
    }
  )

/**
 * Утилиты для работы со схемами
 */
export const formSchemaUtils = {
  /**
   * Создание схемы с кастомными сообщениями
   */
  withCustomMessages: <T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    messages: Partial<Record<keyof T, string>>
  ) => {
    const shape = { ...schema.shape }
    
    Object.entries(messages).forEach(([key, message]) => {
      const field = shape[key as keyof T]
      if (field && message) {
        // Для строковых полей добавляем кастомное сообщение
        if (field instanceof z.ZodString) {
          shape[key as keyof T] = field.min(1, message) as any
        }
      }
    })
    
    return z.object(shape)
  },

  /**
   * Создание опциональной версии схемы
   */
  makeOptional: <T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    fields: (keyof T)[]
  ) => {
    const shape = { ...schema.shape }
    
    fields.forEach(field => {
      const fieldSchema = shape[field]
      if (fieldSchema && 'optional' in fieldSchema) {
        shape[field] = (fieldSchema as any).optional()
      }
    })
    
    return z.object(shape)
  },

  /**
   * Объединение схем
   */
  merge: <T extends z.ZodRawShape, U extends z.ZodRawShape>(
    schema1: z.ZodObject<T>,
    schema2: z.ZodObject<U>
  ) => {
    return schema1.merge(schema2)
  },

  /**
   * Создание схемы для частичного обновления
   */
  createUpdateSchema: <T extends z.ZodRawShape>(
    schema: z.ZodObject<T>
  ) => {
    return schema.partial()
  },
}

/**
 * Экспорт типов для TypeScript
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type OnboardingFormData = z.infer<typeof onboardingSchema>
export type ResumeFormData = z.infer<typeof resumeSchema>
export type OrderFormData = z.infer<typeof orderSchema>