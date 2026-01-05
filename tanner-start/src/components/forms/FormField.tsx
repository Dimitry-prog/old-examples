import { forwardRef, ReactNode } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'

/**
 * Интерфейс для базового поля формы
 */
interface BaseFormFieldProps {
  label?: string
  description?: string
  required?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Интерфейс для контролируемого поля формы
 */
interface ControlledFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps {
  name: TName
  control: Control<TFieldValues>
  render: (props: {
    field: {
      value: any
      onChange: (value: any) => void
      onBlur: () => void
      name: string
    }
    fieldState: {
      error?: { message?: string }
      isDirty: boolean
      isTouched: boolean
    }
  }) => ReactNode
}

/**
 * Базовый компонент поля формы
 */
export function FormFieldBase({ 
  label, 
  description, 
  required, 
  className, 
  children 
}: BaseFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

/**
 * Контролируемое поле формы
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  render,
  label,
  description,
  required,
  className,
}: ControlledFormFieldProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error, isDirty, isTouched },
  } = useController({
    name,
    control,
  })

  return (
    <FormFieldBase
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {render({ field, fieldState: { error, isDirty, isTouched } })}
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </FormFieldBase>
  )
}

/**
 * Компонент Input для форм
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
FormInput.displayName = 'FormInput'

/**
 * Компонент Textarea для форм
 */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
FormTextarea.displayName = 'FormTextarea'

/**
 * Компонент Select для форм
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)
FormSelect.displayName = 'FormSelect'

/**
 * Компонент Checkbox для форм
 */
interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
  label?: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
      </div>
    )
  }
)
FormCheckbox.displayName = 'FormCheckbox'

/**
 * Компонент Radio для форм
 */
interface FormRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
  options: { value: string; label: string }[]
}

export function FormRadio({ 
  name, 
  error, 
  options, 
  className, 
  ...props 
}: FormRadioProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            className={cn(
              'h-4 w-4 border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus:ring-red-500'
            )}
            {...props}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}

/**
 * Компонент для отображения ошибок формы
 */
interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <p className={cn('text-sm text-red-500', className)}>
      {message}
    </p>
  )
}

/**
 * Компонент для отображения описания поля
 */
interface FormDescriptionProps {
  children: ReactNode
  className?: string
}

export function FormDescription({ children, className }: FormDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}

/**
 * Компонент для группировки полей формы
 */
interface FormGroupProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormGroup({ title, description, children, className }: FormGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}