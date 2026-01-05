import { useState } from 'react'
import { useZodForm } from '@/hooks/useZodForm'
import { z } from 'zod'

/**
 * Примеры различных типов Zod валидации
 */

// Пример условной валидации
const conditionalSchema = z
  .object({
    hasAccount: z.boolean(),
    email: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasAccount) {
        return data.email && data.email.length > 0 && z.string().email().safeParse(data.email).success
      }
      return true
    },
    {
      message: 'При наличии аккаунта email обязателен и должен быть корректным',
      path: ['email'],
    }
  )
  .refine(
    (data) => {
      if (data.hasAccount) {
        return data.password && data.password.length >= 8
      }
      return true
    },
    {
      message: 'При наличии аккаунта пароль должен содержать минимум 8 символов',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.hasAccount && data.password) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: 'Пароли должны совпадать',
      path: ['confirmPassword'],
    }
  )

// Пример валидации массивов
const arrayValidationSchema = z.object({
  tags: z
    .array(z.string().min(1, 'Тег не может быть пустым'))
    .min(1, 'Добавьте хотя бы один тег')
    .max(5, 'Максимум 5 тегов')
    .refine(
      (tags) => new Set(tags).size === tags.length,
      {
        message: 'Теги должны быть уникальными',
      }
    ),
  categories: z
    .array(z.enum(['tech', 'design', 'business', 'marketing']))
    .min(1, 'Выберите хотя бы одну категорию'),
  priorities: z
    .array(z.number().min(1).max(10))
    .length(3, 'Должно быть ровно 3 приоритета')
    .refine(
      (priorities) => priorities.every((p, i, arr) => arr.indexOf(p) === i),
      {
        message: 'Приоритеты должны быть уникальными',
      }
    ),
})

// Пример валидации файлов (не используется в демо, но показывает возможности)
// const fileValidationSchema = z.object({
//   avatar: z
//     .instanceof(File)
//     .refine((file) => file.size <= 5000000, 'Файл должен быть меньше 5MB')
//     .refine(
//       (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
//       'Поддерживаются только JPEG, PNG и WebP'
//     ),
//   documents: z
//     .array(z.instanceof(File))
//     .min(1, 'Загрузите хотя бы один документ')
//     .max(3, 'Максимум 3 документа')
//     .refine(
//       (files) => files.every(file => file.size <= 10000000),
//       'Каждый файл должен быть меньше 10MB'
//     ),
// })

// Пример валидации дат
const dateValidationSchema = z.object({
  birthDate: z
    .string()
    .min(1, 'Дата рождения обязательна')
    .refine(
      (date) => {
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 18 && age <= 120
      },
      {
        message: 'Возраст должен быть от 18 до 120 лет',
      }
    ),
  eventDate: z
    .string()
    .min(1, 'Дата события обязательна')
    .refine(
      (date) => new Date(date) > new Date(),
      {
        message: 'Дата события должна быть в будущем',
      }
    ),
  dateRange: z
    .object({
      start: z.string().min(1, 'Дата начала обязательна'),
      end: z.string().min(1, 'Дата окончания обязательна'),
    })
    .refine(
      (data) => new Date(data.start) < new Date(data.end),
      {
        message: 'Дата начала должна быть раньше даты окончания',
        path: ['end'],
      }
    ),
})

// Пример валидации с трансформацией данных
const transformationSchema = z.object({
  price: z
    .string()
    .min(1, 'Цена обязательна')
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, 'Цена должна быть положительным числом'),
  tags: z
    .string()
    .transform((val) => val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0))
    .refine((tags) => tags.length > 0, 'Добавьте хотя бы один тег'),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),
})

/**
 * Компонент с условной валидацией
 */
function ConditionalValidationExample() {
  const form = useZodForm(conditionalSchema, {
    defaultValues: {
      hasAccount: false,
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const hasAccount = form.watch('hasAccount')

  const onSubmit = async (data: z.infer<typeof conditionalSchema>) => {
    console.log('Conditional validation data:', data)
    alert('Форма с условной валидацией отправлена!')
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Условная валидация</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            {...form.register('hasAccount')}
            type="checkbox"
            className="rounded border-gray-300"
          />
          <label className="text-sm">У меня есть аккаунт</label>
        </div>

        {hasAccount && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <input
                {...form.register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль *</label>
              <input
                {...form.register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Подтверждение пароля *</label>
              <input
                {...form.register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}

/**
 * Компонент с валидацией массивов
 */
function ArrayValidationExample() {
  const [tagInput, setTagInput] = useState('')
  const form = useZodForm(arrayValidationSchema, {
    defaultValues: {
      tags: [],
      categories: [],
      priorities: [1, 2, 3],
    },
  })

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues('tags')
      form.setValue('tags', [...currentTags, tagInput.trim()])
      setTagInput('')
      form.trigger('tags')
    }
  }

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter((_, i) => i !== index))
    form.trigger('tags')
  }

  const onSubmit = async (data: z.infer<typeof arrayValidationSchema>) => {
    console.log('Array validation data:', data)
    alert('Форма с валидацией массивов отправлена!')
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Валидация массивов</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Теги (1-5, уникальные)</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Добавить тег"
              className="flex-1 px-3 py-2 border rounded-md bg-background"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Добавить
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {form.watch('tags').map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-muted rounded-md text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          {form.formState.errors.tags && (
            <p className="text-sm text-destructive">{form.formState.errors.tags.message}</p>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Категории (минимум 1)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'tech', label: 'Технологии' },
              { value: 'design', label: 'Дизайн' },
              { value: 'business', label: 'Бизнес' },
              { value: 'marketing', label: 'Маркетинг' },
            ].map((category) => (
              <label key={category.value} className="flex items-center space-x-2">
                <input
                  {...form.register('categories')}
                  type="checkbox"
                  value={category.value}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{category.label}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.categories && (
            <p className="text-sm text-destructive">{form.formState.errors.categories.message}</p>
          )}
        </div>

        {/* Priorities */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Приоритеты (ровно 3, уникальные)</label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                {...form.register(`priorities.${index}`, { valueAsNumber: true })}
                type="number"
                min="1"
                max="10"
                placeholder={`Приоритет ${index + 1}`}
                className="px-3 py-2 border rounded-md bg-background"
              />
            ))}
          </div>
          {form.formState.errors.priorities && (
            <p className="text-sm text-destructive">{form.formState.errors.priorities.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}

/**
 * Компонент с валидацией дат
 */
function DateValidationExample() {
  const form = useZodForm(dateValidationSchema, {
    defaultValues: {
      birthDate: '',
      eventDate: '',
      dateRange: {
        start: '',
        end: '',
      },
    },
  })

  const onSubmit = async (data: z.infer<typeof dateValidationSchema>) => {
    console.log('Date validation data:', data)
    alert('Форма с валидацией дат отправлена!')
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Валидация дат</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Дата рождения (18-120 лет)</label>
          <input
            {...form.register('birthDate')}
            type="date"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
          {form.formState.errors.birthDate && (
            <p className="text-sm text-destructive">{form.formState.errors.birthDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Дата события (в будущем)</label>
          <input
            {...form.register('eventDate')}
            type="date"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
          {form.formState.errors.eventDate && (
            <p className="text-sm text-destructive">{form.formState.errors.eventDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Диапазон дат</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <input
                {...form.register('dateRange.start')}
                type="date"
                placeholder="Дата начала"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.dateRange?.start && (
                <p className="text-sm text-destructive">{form.formState.errors.dateRange.start.message}</p>
              )}
            </div>
            <div>
              <input
                {...form.register('dateRange.end')}
                type="date"
                placeholder="Дата окончания"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.dateRange?.end && (
                <p className="text-sm text-destructive">{form.formState.errors.dateRange.end.message}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}

/**
 * Компонент с трансформацией данных
 */
function TransformationExample() {
  const form = useZodForm(transformationSchema, {
    defaultValues: {
      price: '0',
      tags: '',
      isActive: 'false',
    },
  })

  const onSubmit = async (data: z.infer<typeof transformationSchema>) => {
    console.log('Transformation data:', data)
    alert('Форма с трансформацией данных отправлена!')
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Трансформация данных</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Цена (строка → число)</label>
          <input
            {...form.register('price')}
            type="text"
            placeholder="99.99"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Теги (строка → массив)</label>
          <input
            {...form.register('tags')}
            type="text"
            placeholder="тег1, тег2, тег3"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
          <p className="text-xs text-muted-foreground">Разделяйте теги запятыми</p>
          {form.formState.errors.tags && (
            <p className="text-sm text-destructive">{form.formState.errors.tags.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Активность (строка → boolean)</label>
          <select
            {...form.register('isActive')}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="false">Неактивно</option>
            <option value="true">Активно</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}

/**
 * Главный компонент с примерами
 */
export function ZodValidationExamples() {
  const [activeTab, setActiveTab] = useState<'conditional' | 'arrays' | 'dates' | 'transform'>('conditional')

  const tabs = [
    { id: 'conditional', label: 'Условная валидация' },
    { id: 'arrays', label: 'Массивы' },
    { id: 'dates', label: 'Даты' },
    { id: 'transform', label: 'Трансформация' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Zod Validation Examples</h2>
        <p className="text-muted-foreground mb-6">
          Примеры продвинутых возможностей Zod валидации
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'conditional' && <ConditionalValidationExample />}
        {activeTab === 'arrays' && <ArrayValidationExample />}
        {activeTab === 'dates' && <DateValidationExample />}
        {activeTab === 'transform' && <TransformationExample />}
      </div>

      {/* Info */}
      <div className="bg-muted rounded-lg p-6">
        <h3 className="font-semibold mb-3">Возможности Zod</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">🔍 Валидация:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Условная валидация с refine()</li>
              <li>• Валидация массивов и их элементов</li>
              <li>• Валидация дат и диапазонов</li>
              <li>• Валидация файлов и их свойств</li>
              <li>• Кастомные правила валидации</li>
              <li>• Валидация уникальности</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🔄 Трансформация:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Преобразование строк в числа</li>
              <li>• Парсинг строк в массивы</li>
              <li>• Преобразование строк в boolean</li>
              <li>• Нормализация данных</li>
              <li>• Очистка и форматирование</li>
              <li>• Pipe для цепочки трансформаций</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}