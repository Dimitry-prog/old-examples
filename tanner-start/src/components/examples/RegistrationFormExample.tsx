import { FormError, FormField, FormInput } from '@/components/forms/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useZodForm } from '@/hooks/useZodForm'
import { registerSchema, type RegisterData } from '@/lib/schemas'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

/**
 * Пример формы регистрации с Zod валидацией
 * Демонстрирует:
 * - Интеграцию React Hook Form с Zod
 * - Использование shadcn/ui компонентов
 * - Обработку ошибок валидации
 * - Состояния загрузки и успеха
 */
export function RegistrationFormExample() {
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    control,
    formState: { isValid },
    isSubmitting,
    submitError,
    handleSubmitWithValidation,
    reset,
  } = useZodForm(registerSchema, {
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmitWithValidation(async (data: RegisterData) => {
    // Симуляция API запроса
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Симуляция случайной ошибки (20% вероятность)
    if (Math.random() < 0.2) {
      throw new Error('Email уже используется')
    }

    console.log('Registration data:', data)
    setIsSuccess(true)

    // Сброс формы через 3 секунды
    setTimeout(() => {
      setIsSuccess(false)
      reset()
    }, 3000)
  })

  if (isSuccess) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Регистрация успешна!</AlertTitle>
        <AlertDescription className="text-green-600">
          Ваш аккаунт был успешно создан. Проверьте email для подтверждения.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Форма регистрации</h3>
        <p className="text-sm text-muted-foreground">
          Эта форма демонстрирует валидацию в реальном времени с помощью Zod схем.
          Попробуйте ввести некорректные данные, чтобы увидеть сообщения об ошибках.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          name="name"
          control={control}
          label="Полное имя"
          required
          description="Минимум 2 символа, только буквы и пробелы"
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              placeholder="Иван Иванов"
              error={!!fieldState.error}
              disabled={isSubmitting}
            />
          )}
        />

        <FormField
          name="email"
          control={control}
          label="Email"
          required
          description="Используйте действительный email адрес"
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              type="email"
              placeholder="example@email.com"
              error={!!fieldState.error}
              disabled={isSubmitting}
            />
          )}
        />

        <FormField
          name="password"
          control={control}
          label="Пароль"
          required
          description="Минимум 8 символов, должен содержать заглавные и строчные буквы, цифры"
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              type="password"
              placeholder="Введите пароль"
              error={!!fieldState.error}
              disabled={isSubmitting}
            />
          )}
        />

        <FormField
          name="confirmPassword"
          control={control}
          label="Подтверждение пароля"
          required
          description="Должен совпадать с паролем"
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              type="password"
              placeholder="Повторите пароль"
              error={!!fieldState.error}
              disabled={isSubmitting}
            />
          )}
        />

        {submitError && (
          <FormError message={submitError} />
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Очистить
          </Button>
        </div>
      </form>

      <div className="rounded-lg bg-muted p-4 space-y-2">
        <h4 className="text-sm font-semibold">Технические детали:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Валидация через Zod схему (registerSchema)</li>
          <li>Интеграция с React Hook Form через useZodForm хук</li>
          <li>Компоненты из shadcn/ui (Input, Button, Alert)</li>
          <li>Обработка состояний: загрузка, ошибка, успех</li>
          <li>Симуляция API запроса с задержкой 2 секунды</li>
          <li>20% вероятность случайной ошибки для демонстрации</li>
        </ul>
      </div>
    </div>
  )
}
