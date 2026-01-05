# Zod Integration Guide

Руководство по интеграции Zod валидации с React Hook Form в проекте.

## Обзор

Интеграция Zod с React Hook Form обеспечивает:
- Типобезопасную валидацию форм
- Автоматическую генерацию TypeScript типов
- Переиспользуемые схемы валидации
- Сложные правила валидации
- Трансформацию данных

## Основные файлы

### 1. Схемы валидации (`src/lib/formSchemas.ts`)

Содержит все схемы Zod для валидации форм:

```typescript
// Базовые схемы
export const emailSchema = z.string().email('Некорректный email')
export const passwordSchema = z.string().min(8, 'Минимум 8 символов')

// Схемы для форм
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
  remember: z.boolean().optional(),
})

// Типы TypeScript
export type LoginFormData = z.infer<typeof loginSchema>
```

### 2. Хуки для форм (`src/hooks/useZodForm.ts`)

Предоставляет хуки для работы с Zod формами:

- `useZodForm` - базовые формы
- `useZodMultiStepForm` - многошаговые формы  
- `useZodDynamicForm` - динамические формы

### 3. Компоненты примеров

- `ZodIntegrationDemo` - основные примеры интеграции
- `ZodValidationExamples` - продвинутые примеры валидации
- `ZodFormExample` - детальные примеры форм

## Использование

### Базовая форма

```typescript
import { useZodForm } from '@/hooks/useZodForm'
import { loginSchema, type LoginFormData } from '@/lib/formSchemas'

function LoginForm() {
  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log(data) // Типизированные данные
  }

  return (
    <form onSubmit={form.handleSubmitWithValidation(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <p>{form.formState.errors.email.message}</p>
      )}
      
      <button type="submit" disabled={form.isSubmitting}>
        Отправить
      </button>
    </form>
  )
}
```

### Многошаговая форма

```typescript
const form = useZodMultiStepForm(
  fullSchema,
  ['step1', 'step2', 'step3'],
  {
    step1: step1Schema,
    step2: step2Schema,
    step3: step3Schema,
  }
)

// Навигация между шагами
form.nextStep()
form.prevStep()
form.goToStep(2)

// Текущий шаг
form.currentStep // 0, 1, 2
form.currentStepName // 'step1', 'step2', 'step3'
```

### Динамические формы

```typescript
const form = useZodDynamicForm(
  resumeSchema,
  'skills', // поле массива
  skillSchema // схема элемента
)

// Управление элементами
form.addItem({ name: '', level: 'beginner' })
form.removeItem(index)
form.validateItem(index, value)
```

## Возможности валидации

### 1. Базовая валидация

```typescript
const schema = z.object({
  email: z.string().email('Некорректный email'),
  age: z.number().min(18, 'Минимум 18 лет'),
  name: z.string().min(2, 'Минимум 2 символа'),
})
```

### 2. Условная валидация

```typescript
const schema = z.object({
  hasAccount: z.boolean(),
  email: z.string().optional(),
}).refine(
  (data) => {
    if (data.hasAccount) {
      return data.email && z.string().email().safeParse(data.email).success
    }
    return true
  },
  {
    message: 'Email обязателен при наличии аккаунта',
    path: ['email'],
  }
)
```

### 3. Валидация массивов

```typescript
const schema = z.object({
  tags: z.array(z.string().min(1))
    .min(1, 'Минимум 1 тег')
    .max(5, 'Максимум 5 тегов')
    .refine(
      (tags) => new Set(tags).size === tags.length,
      'Теги должны быть уникальными'
    ),
})
```

### 4. Валидация дат

```typescript
const schema = z.object({
  birthDate: z.string().refine(
    (date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear()
      return age >= 18 && age <= 120
    },
    'Возраст должен быть от 18 до 120 лет'
  ),
})
```

### 5. Трансформация данных

```typescript
const schema = z.object({
  price: z.string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, 'Положительное число'),
  tags: z.string()
    .transform((val) => val.split(',').map(s => s.trim())),
})
```

## Утилиты

### Валидация данных

```typescript
import { validationUtils } from '@/lib/validation'

const result = validationUtils.validate(schema, data)
if (result.success) {
  console.log(result.data) // Валидные данные
} else {
  console.log(result.error) // Ошибки валидации
}
```

### Работа со схемами

```typescript
import { formSchemaUtils } from '@/lib/formSchemas'

// Создание опциональной версии
const optionalSchema = formSchemaUtils.makeOptional(
  baseSchema, 
  ['field1', 'field2']
)

// Объединение схем
const mergedSchema = formSchemaUtils.merge(schema1, schema2)

// Схема для обновления (все поля опциональные)
const updateSchema = formSchemaUtils.createUpdateSchema(baseSchema)
```

## Обработка ошибок

### Ошибки валидации

```typescript
// В компоненте
{form.formState.errors.email && (
  <p className="text-destructive">
    {form.formState.errors.email.message}
  </p>
)}

// Серверные ошибки
form.setServerErrors({
  email: 'Email уже используется',
  password: 'Слишком простой пароль',
})
```

### Глобальные ошибки

```typescript
// Ошибка отправки формы
{form.submitError && (
  <p className="text-destructive">{form.submitError}</p>
)}

// Очистка ошибки
form.setSubmitError(null)
```

## Интеграция с API

```typescript
const onSubmit = async (data: FormData) => {
  try {
    const response = await api.post('/endpoint', data)
    // Успех
  } catch (error) {
    if (error.response?.status === 422) {
      // Ошибки валидации с сервера
      form.setServerErrors(error.response.data.errors)
    } else {
      // Общая ошибка
      form.setSubmitError('Произошла ошибка при отправке')
    }
  }
}
```

## Лучшие практики

### 1. Организация схем

```typescript
// Группировка по функциональности
export const authSchemas = {
  login: loginSchema,
  register: registerSchema,
  resetPassword: resetPasswordSchema,
}

// Переиспользование базовых валидаторов
const emailValidator = z.string().email('Некорректный email')
```

### 2. Типизация

```typescript
// Экспорт типов вместе со схемами
export const loginSchema = z.object({...})
export type LoginFormData = z.infer<typeof loginSchema>

// Использование в компонентах
const onSubmit = (data: LoginFormData) => {
  // data автоматически типизирована
}
```

### 3. Сообщения об ошибках

```typescript
// Локализованные сообщения
const messages = {
  required: 'Поле обязательно',
  email: 'Некорректный email',
  minLength: (min: number) => `Минимум ${min} символов`,
}

// Использование в схемах
z.string().min(1, messages.required)
```

### 4. Производительность

```typescript
// Ленивая валидация для больших форм
const form = useZodForm(schema, {
  mode: 'onSubmit', // Валидация только при отправке
  reValidateMode: 'onChange', // Ре-валидация при изменении
})

// Дебаунс для валидации в реальном времени
const debouncedValidation = useMemo(
  () => debounce(form.trigger, 300),
  [form.trigger]
)
```

## Тестирование

```typescript
import { loginSchema } from '@/lib/formSchemas'

describe('Login Schema', () => {
  it('should validate correct data', () => {
    const data = { email: 'test@example.com', password: 'password' }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = { email: 'invalid', password: 'password' }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
```

## Заключение

Интеграция Zod с React Hook Form обеспечивает:

- ✅ Типобезопасность на уровне компиляции
- ✅ Переиспользуемые схемы валидации
- ✅ Сложные правила валидации
- ✅ Автоматическую генерацию типов
- ✅ Отличную производительность
- ✅ Простоту тестирования

Все примеры и компоненты готовы к использованию в проекте.