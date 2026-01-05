import { useState } from 'react'
import { useZodForm, useZodMultiStepForm, useZodDynamicForm } from '@/hooks/useZodForm'
import {
  loginSchema,
  registerSchema,
  onboardingSchema,
  personalInfoStepSchema,
  addressStepSchema,
  preferencesStepSchema,
  resumeSchema,
  skillSchema,
  type LoginFormData,
  type RegisterFormData,
  type OnboardingFormData,
  type ResumeFormData,
} from '@/lib/formSchemas'

/**
 * Демонстрация базовой Zod валидации
 */
function BasicZodFormDemo() {
  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login data:', data)
    alert('Форма отправлена! Проверьте консоль.')
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Базовая Zod валидация</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
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
          <label className="text-sm font-medium">Пароль</label>
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

        <div className="flex items-center space-x-2">
          <input
            {...form.register('remember')}
            type="checkbox"
            className="rounded border-gray-300"
          />
          <label className="text-sm">Запомнить меня</label>
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Отправка...' : 'Войти'}
        </button>

        {form.submitError && (
          <p className="text-sm text-destructive">{form.submitError}</p>
        )}
      </form>
    </div>
  )
}

/**
 * Демонстрация сложной валидации с условными правилами
 */
function ComplexValidationDemo() {
  const form = useZodForm(registerSchema, {
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Register data:', data)
    alert('Регистрация успешна! Проверьте консоль.')
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Сложная валидация</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Имя *</label>
            <input
              {...form.register('name')}
              type="text"
              placeholder="Ваше имя"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              {...form.register('acceptTerms')}
              type="checkbox"
              className="rounded border-gray-300"
            />
            <label className="text-sm">Я принимаю условия использования *</label>
          </div>
          {form.formState.errors.acceptTerms && (
            <p className="text-sm text-destructive">{form.formState.errors.acceptTerms.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        {form.submitError && (
          <p className="text-sm text-destructive">{form.submitError}</p>
        )}
      </form>
    </div>
  )
}

/**
 * Демонстрация многошаговой формы
 */
function MultiStepFormDemo() {
  const form = useZodMultiStepForm(
    onboardingSchema,
    ['personalInfo', 'address', 'preferences'],
    {
      personalInfo: personalInfoStepSchema,
      address: addressStepSchema,
      preferences: preferencesStepSchema,
    },
    {
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        interests: [],
        newsletter: false,
        notifications: true,
      },
    }
  )

  const onSubmit = async (data: OnboardingFormData) => {
    console.log('Onboarding data:', data)
    alert('Онбординг завершен! Проверьте консоль.')
  }

  const stepTitles = {
    personalInfo: 'Личная информация',
    address: 'Адрес',
    preferences: 'Предпочтения',
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Многошаговая форма</h3>
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-4">
          {form.steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= form.currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < form.steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < form.currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Шаг {form.currentStep + 1} из {form.steps.length}: {stepTitles[form.currentStepName as keyof typeof stepTitles]}
        </p>
        
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${form.getProgress()}%` }}
          />
        </div>
      </div>

      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-4">
        {/* Step 1: Personal Info */}
        {form.currentStepName === 'personalInfo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Имя *</label>
                <input
                  {...form.register('firstName')}
                  type="text"
                  placeholder="Имя"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Фамилия *</label>
                <input
                  {...form.register('lastName')}
                  type="text"
                  placeholder="Фамилия"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

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
              <label className="text-sm font-medium">Телефон *</label>
              <input
                {...form.register('phone')}
                type="tel"
                placeholder="+7 (999) 123-45-67"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {form.currentStepName === 'address' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Улица *</label>
              <input
                {...form.register('street')}
                type="text"
                placeholder="Улица, дом, квартира"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.street && (
                <p className="text-sm text-destructive">{form.formState.errors.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Город *</label>
                <input
                  {...form.register('city')}
                  type="text"
                  placeholder="Город"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Регион *</label>
                <input
                  {...form.register('state')}
                  type="text"
                  placeholder="Регион"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Почтовый индекс *</label>
                <input
                  {...form.register('zipCode')}
                  type="text"
                  placeholder="123456"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
                {form.formState.errors.zipCode && (
                  <p className="text-sm text-destructive">{form.formState.errors.zipCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Страна *</label>
                <input
                  {...form.register('country')}
                  type="text"
                  placeholder="Страна"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {form.currentStepName === 'preferences' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Интересы *</label>
              <div className="grid grid-cols-2 gap-2">
                {['Технологии', 'Спорт', 'Музыка', 'Путешествия', 'Кулинария', 'Искусство'].map((interest) => (
                  <label key={interest} className="flex items-center space-x-2">
                    <input
                      {...form.register('interests')}
                      type="checkbox"
                      value={interest}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{interest}</span>
                  </label>
                ))}
              </div>
              {form.formState.errors.interests && (
                <p className="text-sm text-destructive">{form.formState.errors.interests.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  {...form.register('newsletter')}
                  type="checkbox"
                  className="rounded border-gray-300"
                />
                <label className="text-sm">Подписаться на новости</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  {...form.register('notifications')}
                  type="checkbox"
                  className="rounded border-gray-300"
                />
                <label className="text-sm">Получать уведомления</label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={form.prevStep}
            disabled={form.isFirstStep}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent disabled:opacity-50"
          >
            Назад
          </button>

          {form.isLastStep ? (
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {form.isSubmitting ? 'Отправка...' : 'Завершить'}
            </button>
          ) : (
            <button
              type="button"
              onClick={form.nextStep}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Далее
            </button>
          )}
        </div>

        {form.submitError && (
          <p className="text-sm text-destructive">{form.submitError}</p>
        )}
      </form>
    </div>
  )
}

/**
 * Демонстрация динамических форм
 */
function DynamicFormDemo() {
  const form = useZodDynamicForm(
    resumeSchema,
    'skills',
    skillSchema,
    {
      defaultValues: {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        },
        skills: [],
        education: [],
        summary: '',
      },
    }
  )

  const onSubmit = async (data: ResumeFormData) => {
    console.log('Resume data:', data)
    alert('Резюме сохранено! Проверьте консоль.')
  }

  const addSkill = () => {
    form.addItem({
      name: '',
      level: 'beginner' as const,
      yearsOfExperience: 0,
    })
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Динамические формы</h3>
      
      <form onSubmit={form.handleSubmitWithValidation(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h4 className="font-medium">Личная информация</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Имя *</label>
              <input
                {...form.register('personalInfo.firstName')}
                type="text"
                placeholder="Имя"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.personalInfo?.firstName && (
                <p className="text-sm text-destructive">{form.formState.errors.personalInfo.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Фамилия *</label>
              <input
                {...form.register('personalInfo.lastName')}
                type="text"
                placeholder="Фамилия"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {form.formState.errors.personalInfo?.lastName && (
                <p className="text-sm text-destructive">{form.formState.errors.personalInfo.lastName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Навыки</h4>
            <button
              type="button"
              onClick={addSkill}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Добавить навык
            </button>
          </div>

          {form.getItems().map((_: any, index: number) => (
            <div key={index} className="border rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">Навык {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => form.removeItem(index)}
                  className="text-destructive hover:text-destructive/80 text-sm"
                >
                  Удалить
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Название *</label>
                  <input
                    {...form.register(`skills.${index}.name` as const)}
                    type="text"
                    placeholder="JavaScript"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Уровень *</label>
                  <select
                    {...form.register(`skills.${index}.level` as const)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                    <option value="expert">Эксперт</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Опыт (лет) *</label>
                  <input
                    {...form.register(`skills.${index}.yearsOfExperience` as const, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="0"
                    max="50"
                    placeholder="2"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          ))}

          {form.formState.errors.skills && (
            <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Краткое описание *</label>
          <textarea
            {...form.register('summary')}
            placeholder="Расскажите о себе..."
            rows={4}
            className="w-full px-3 py-2 border rounded-md bg-background resize-none"
          />
          {form.formState.errors.summary && (
            <p className="text-sm text-destructive">{form.formState.errors.summary.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Сохранение...' : 'Сохранить резюме'}
        </button>

        {form.submitError && (
          <p className="text-sm text-destructive">{form.submitError}</p>
        )}
      </form>
    </div>
  )
}

/**
 * Главный компонент демонстрации
 */
export function ZodIntegrationDemo() {
  const [activeTab, setActiveTab] = useState<'basic' | 'complex' | 'multistep' | 'dynamic'>('basic')

  const tabs = [
    { id: 'basic', label: 'Базовая валидация' },
    { id: 'complex', label: 'Сложная валидация' },
    { id: 'multistep', label: 'Многошаговая форма' },
    { id: 'dynamic', label: 'Динамические формы' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Zod Integration Demo</h2>
        <p className="text-muted-foreground mb-6">
          Демонстрация интеграции Zod валидации с React Hook Form
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
        {activeTab === 'basic' && <BasicZodFormDemo />}
        {activeTab === 'complex' && <ComplexValidationDemo />}
        {activeTab === 'multistep' && <MultiStepFormDemo />}
        {activeTab === 'dynamic' && <DynamicFormDemo />}
      </div>

      {/* Features info */}
      <div className="bg-muted rounded-lg p-6">
        <h3 className="font-semibold mb-3">Возможности интеграции</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">✅ Реализовано:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Базовая Zod валидация</li>
              <li>• Сложные правила валидации</li>
              <li>• Многошаговые формы</li>
              <li>• Динамические поля</li>
              <li>• Условная валидация</li>
              <li>• Кастомные сообщения об ошибках</li>
              <li>• Интеграция с React Hook Form</li>
              <li>• TypeScript типизация</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🔧 Утилиты:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• useZodForm - базовые формы</li>
              <li>• useZodMultiStepForm - многошаговые</li>
              <li>• useZodDynamicForm - динамические</li>
              <li>• Валидация на уровне полей</li>
              <li>• Обработка серверных ошибок</li>
              <li>• Автоматическая типизация</li>
              <li>• Переиспользуемые схемы</li>
              <li>• Утилиты для работы со схемами</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}