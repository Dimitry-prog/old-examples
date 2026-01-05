import {
  loginSchema,
  registerSchema,
  contactSchema,
  profileSchema,
  type LoginFormData,
  type RegisterFormData,
  type ContactFormData,
  type ProfileFormData,
} from '@/lib/formSchemas'

/**
 * Пример простой формы входа с Zod валидацией
 */
export function LoginFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Login data:', data)
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (data.email === 'error@example.com') {
        setError('email', { message: 'Пользователь с таким email не найден' })
        return
      }

      alert('Вход выполнен успешно!')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Форма входа с Zod валидацией</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="your@email.com"
            onChange={(e) => {
              register('email').onChange(e)
              if (errors.email) clearErrors('email')
            }}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Пароль</label>
          <input
            {...register('password')}
            type="password"
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
            onChange={(e) => {
              register('password').onChange(e)
              if (errors.password) clearErrors('password')
            }}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            {...register('remember')}
            type="checkbox"
            className="rounded"
          />
          <label className="text-sm">Запомнить меня</label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}