import { useState } from 'react'
import { useForm, useDynamicFields } from '@/hooks/useForm'
import { 
  FormField, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormCheckbox, 
  FormRadio,
  FormGroup,
  FormError 
} from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Интерфейс для примера формы
 */
interface ExampleFormData {
  name: string
  email: string
  age: number
  bio: string
  country: string
  newsletter: boolean
  gender: string
  skills: string[]
  contacts: Array<{
    type: string
    value: string
  }>
}

/**
 * Пример использования форм
 */
export function FormsExample() {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'dynamic'>('basic')

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b">
        {[
          { key: 'basic', label: 'Базовая форма' },
          { key: 'advanced', label: 'Продвинутая форма' },
          { key: 'dynamic', label: 'Динамические поля' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'basic' && <BasicFormExample />}
      {activeTab === 'advanced' && <AdvancedFormExample />}
      {activeTab === 'dynamic' && <DynamicFormExample />}
    </div>
  )
}

/**
 * Базовая форма
 */
function BasicFormExample() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    isSubmitting,
    submitError,
    handleSubmitWithError,
  } = useForm<{ name: string; email: string; message: string }>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = handleSubmitWithError(async (data) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Form submitted:', data)
    alert('Форма отправлена успешно!')
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Базовая форма</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            control={control}
            label="Имя"
            required
            render={({ field, fieldState }) => (
              <FormInput
                {...field}
                placeholder="Введите ваше имя"
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

          <FormField
            name="message"
            control={control}
            label="Сообщение"
            description="Расскажите нам о себе"
            render={({ field, fieldState }) => (
              <FormTextarea
                {...field}
                placeholder="Ваше сообщение..."
                error={!!fieldState.error}
                disabled={isSubmitting}
              />
            )}
          />

          {submitError && <FormError message={submitError} />}

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Продвинутая форма с группировкой
 */
function AdvancedFormExample() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    isSubmitting,
    submitError,
    handleSubmitWithError,
  } = useForm<ExampleFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      bio: '',
      country: '',
      newsletter: false,
      gender: '',
      skills: [],
      contacts: [],
    },
  })

  const onSubmit = handleSubmitWithError(async (data) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Advanced form submitted:', data)
    alert('Продвинутая форма отправлена!')
  })

  const countryOptions = [
    { value: 'ru', label: 'Россия' },
    { value: 'us', label: 'США' },
    { value: 'de', label: 'Германия' },
    { value: 'fr', label: 'Франция' },
  ]

  const genderOptions = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'other', label: 'Другой' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Продвинутая форма</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormGroup title="Личная информация">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="age"
                control={control}
                label="Возраст"
                render={({ field, fieldState }) => (
                  <FormInput
                    {...field}
                    type="number"
                    min="18"
                    max="100"
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

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
              name="bio"
              control={control}
              label="О себе"
              description="Расскажите немного о себе"
              render={({ field, fieldState }) => (
                <FormTextarea
                  {...field}
                  placeholder="Ваша биография..."
                  error={!!fieldState.error}
                  disabled={isSubmitting}
                />
              )}
            />
          </FormGroup>

          <FormGroup title="Дополнительная информация">
            <FormField
              name="country"
              control={control}
              label="Страна"
              render={({ field, fieldState }) => (
                <FormSelect
                  {...field}
                  options={countryOptions}
                  placeholder="Выберите страну"
                  error={!!fieldState.error}
                  disabled={isSubmitting}
                />
              )}
            />

            <FormField
              name="gender"
              control={control}
              label="Пол"
              render={({ field, fieldState }) => (
                <FormRadio
                  {...field}
                  options={genderOptions}
                  error={!!fieldState.error}
                />
              )}
            />

            <FormField
              name="newsletter"
              control={control}
              render={({ field, fieldState }) => (
                <FormCheckbox
                  {...field}
                  checked={field.value}
                  label="Подписаться на рассылку"
                  error={!!fieldState.error}
                  disabled={isSubmitting}
                />
              )}
            />
          </FormGroup>

          {submitError && <FormError message={submitError} />}

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Форма с динамическими полями
 */
function DynamicFormExample() {
  const form = useForm<{ contacts: Array<{ type: string; value: string }> }>({
    mode: 'onChange',
    defaultValues: {
      contacts: [{ type: 'email', value: '' }],
    },
  })

  const dynamicFields = useDynamicFields(form, 'contacts')

  const {
    control,
    handleSubmit,
    formState: { isValid },
    isSubmitting,
    submitError,
    handleSubmitWithError,
  } = form

  const onSubmit = handleSubmitWithError(async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Dynamic form submitted:', data)
    alert('Форма с динамическими полями отправлена!')
  })

  const contactTypes = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Телефон' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'website', label: 'Веб-сайт' },
  ]

  const contacts = dynamicFields.getFields()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамические поля</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormGroup 
            title="Контактная информация" 
            description="Добавьте способы связи с вами"
          >
            {contacts.map((_, index) => (
              <div key={index} className="flex space-x-2 items-end">
                <FormField
                  name={`contacts.${index}.type` as any}
                  control={control}
                  label={index === 0 ? 'Тип' : undefined}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      {...field}
                      options={contactTypes}
                      placeholder="Тип контакта"
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <FormField
                  name={`contacts.${index}.value` as any}
                  control={control}
                  label={index === 0 ? 'Значение' : undefined}
                  render={({ field, fieldState }) => (
                    <FormInput
                      {...field}
                      placeholder="Введите контакт"
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => dynamicFields.removeField(index)}
                  disabled={contacts.length === 1 || isSubmitting}
                >
                  Удалить
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => dynamicFields.addField({ type: 'email', value: '' })}
              disabled={isSubmitting}
            >
              Добавить контакт
            </Button>
          </FormGroup>

          {submitError && <FormError message={submitError} />}

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить контакты'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}