import { useZodForm, useZodMultiStepForm, zodFormUtils } from '@/hooks/useZodForm'
import { FormField, FormInput, FormError, FormGroup } from './FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { registerSchema, nameSchema, emailSchema, passwordSchema, type RegisterData } from '@/lib/schemas'

/**
 * Интерфейс пропсов для формы регистрации
 */
interface RegisterFormProps {
  onSuccess?: (data: RegisterData) => void
  onLoginClick?: () => void
  className?: string
}

/**
 * Форма регистрации
 */
export function RegisterForm({ onSuccess, onLoginClick, className }: RegisterFormProps) {
  const {
    control,
    watch,
    formState: { errors, isValid },
    isSubmitting,
    submitError,
    handleSubmitWithValidation,
  } = useZodForm(registerSchema, {
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  })

  // Следим за паролем для валидации подтверждения
  const password = watch('password')

  const onSubmit = handleSubmitWithValidation(async (data: RegisterData) => {
    // В реальном приложении здесь будет API запрос
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onSuccess?.(data)
  })

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        <CardDescription className="text-center">
          Создайте новый аккаунт
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormGroup title="Личная информация">
            <FormField
              name="name"
              control={control}
              label="Полное имя"
              required
              description="Введите ваше имя и фамилию"
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
              description="Мы будем использовать этот email для входа в систему"
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
          </FormGroup>

          <FormGroup title="Безопасность">
            <FormField
              name="password"
              control={control}
              label="Пароль"
              required
              description="Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры"
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
              description="Повторите пароль для подтверждения"
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
          </FormGroup>

          {submitError && (
            <FormError message={submitError} />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Создание аккаунта...' : 'Создать аккаунт'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onLoginClick}
            >
              Войти
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Многошаговая форма регистрации
 */
export function MultiStepRegisterForm({ onSuccess, onLoginClick, className }: RegisterFormProps) {
  // Создаем схемы для каждого шага
  const stepSchemas = {
    personal: zodFormUtils.createStepSchema(registerSchema, ['name', 'email']),
    security: zodFormUtils.createStepSchema(registerSchema, ['password', 'confirmPassword']),
    confirmation: registerSchema, // Полная валидация на последнем шаге
  }

  const {
    control,
    watch,
    formState: { errors, isValid },
    isSubmitting,
    submitError,
    handleSubmitWithValidation,
    currentStep,
    currentStepName,
    steps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    getProgress,
  } = useZodMultiStepForm(
    registerSchema,
    ['personal', 'security', 'confirmation'],
    stepSchemas,
    {
      defaultValues: {
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      },
    }
  )

  const onSubmit = handleSubmitWithValidation(async (data: RegisterData) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    onSuccess?.(data)
  })

  const handleNext = async () => {
    const isStepValid = await nextStep()
    if (!isStepValid) {
      console.log('Step validation failed')
    }
  }

  const renderStep = () => {
    switch (currentStepName) {
      case 'personal':
        return (
          <FormGroup title="Личная информация" description="Расскажите нам о себе">
            <FormField
              name="name"
              control={control}
              label="Полное имя"
              required
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
          </FormGroup>
        )

      case 'security':
        return (
          <FormGroup title="Безопасность" description="Создайте надежный пароль">
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

            <FormField
              name="confirmPassword"
              control={control}
              label="Подтверждение пароля"
              required
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
          </FormGroup>
        )

      case 'confirmation':
        return (
          <FormGroup title="Подтверждение" description="Проверьте введенные данные">
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div>
                <span className="font-medium">Имя:</span> {watch('name')}
              </div>
              <div>
                <span className="font-medium">Email:</span> {watch('email')}
              </div>
            </div>
          </FormGroup>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        <CardDescription className="text-center">
          Шаг {currentStep + 1} из {steps.length}
        </CardDescription>
        
        {/* Прогресс бар */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {renderStep()}

          {submitError && (
            <FormError message={submitError} />
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep || isSubmitting}
            >
              Назад
            </Button>

            {isLastStep ? (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Далее
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onLoginClick}
            >
              Войти
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}