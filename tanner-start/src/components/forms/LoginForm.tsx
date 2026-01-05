import { useZodForm } from '@/hooks/useZodForm'
import { useAuthContext } from '@/contexts/AuthContext'
import { FormField, FormInput, FormError } from './FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginCredentials } from '@/lib/schemas'

/**
 * Интерфейс пропсов для формы входа
 */
interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

/**
 * Форма входа в систему
 */
export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { signIn } = useAuthContext()
  
  const {
    control,
    formState: { errors, isValid },
    isSubmitting,
    submitError,
    handleSubmitWithValidation,
  } = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmitWithValidation(async (data: LoginCredentials) => {
    await signIn(data.email, data.password)
    onSuccess?.()
  })

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
        <CardDescription className="text-center">
          Введите ваши данные для входа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            name="email"
            control={control}
            label="Email"
            required
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

          {submitError && (
            <FormError message={submitError} />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                // Здесь можно добавить навигацию к форме регистрации
                console.log('Navigate to register')
              }}
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Компактная форма входа (без карточки)
 */
export function CompactLoginForm({ onSuccess, className }: LoginFormProps) {
  const { signIn } = useAuthContext()
  
  const {
    control,
    formState: { errors, isValid },
    isSubmitting,
    submitError,
    handleSubmitWithValidation,
  } = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmitWithValidation(async (data: LoginCredentials) => {
    await signIn(data.email, data.password)
    onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      <FormField
        name="email"
        control={control}
        label="Email"
        required
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

      {submitError && (
        <FormError message={submitError} />
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  )
}

/**
 * Быстрая форма входа (только email и кнопка)
 */
interface QuickLoginFormProps {
  onSubmit: (email: string) => void
  isLoading?: boolean
  className?: string
}

export function QuickLoginForm({ onSubmit, isLoading, className }: QuickLoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<{ email: string }>({
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  return (
    <form 
      onSubmit={handleSubmit((data) => onSubmit(data.email))} 
      className={`flex space-x-2 ${className}`}
    >
      <FormField
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            {...field}
            type="email"
            placeholder="Введите email"
            error={!!fieldState.error}
            disabled={isLoading}
            className="flex-1"
          />
        )}
      />

      <Button
        type="submit"
        disabled={!isValid || isLoading}
      >
        {isLoading ? 'Отправка...' : 'Отправить'}
      </Button>
    </form>
  )
}