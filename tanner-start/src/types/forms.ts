// Типы для форм

export type LoginFormData = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export type ProfileFormData = {
  name: string
  email: string
  avatar?: File | null
}

export type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type FormFieldError = {
  message: string
  type: string
}

export type FormErrors<T> = Partial<Record<keyof T, FormFieldError>>

export type FormState<T> = {
  data: T
  errors: FormErrors<T>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}
