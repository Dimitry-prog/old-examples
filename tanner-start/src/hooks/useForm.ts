import { useForm as useReactHookForm, type UseFormProps, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { useState } from 'react'

/**
 * Расширенный хук для работы с формами
 * Добавляет дополнительную функциональность к react-hook-form
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormProps<TFieldValues>
): UseFormReturn<TFieldValues> & {
  isSubmitting: boolean
  submitError: string | null
  setSubmitError: (error: string | null) => void
  handleSubmitWithError: (onSubmit: (data: TFieldValues) => Promise<void> | void) => (data: TFieldValues) => Promise<void>
} {
  const form = useReactHookForm<TFieldValues>(props)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Обработчик отправки формы с обработкой ошибок
   */
  const handleSubmitWithError = (onSubmit: (data: TFieldValues) => Promise<void> | void) => {
    return async (data: TFieldValues) => {
      try {
        setIsSubmitting(true)
        setSubmitError(null)
        await onSubmit(data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при отправке формы'
        setSubmitError(errorMessage)
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return {
    ...form,
    isSubmitting,
    submitError,
    setSubmitError,
    handleSubmitWithError,
  }
}

/**
 * Хук для работы с многошаговыми формами
 */
export function useMultiStepForm<TFieldValues extends FieldValues = FieldValues>(
  steps: string[],
  props?: UseFormProps<TFieldValues>
) {
  const form = useForm<TFieldValues>(props)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const currentStepName = steps[currentStep]

  /**
   * Переход к следующему шагу
   */
  const nextStep = async () => {
    const isValid = await form.trigger()
    if (isValid && !isLastStep) {
      setCompletedSteps(prev => new Set(prev).add(currentStep))
      setCurrentStep(prev => prev + 1)
    }
    return isValid
  }

  /**
   * Переход к предыдущему шагу
   */
  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  /**
   * Переход к конкретному шагу
   */
  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }

  /**
   * Проверка, завершен ли шаг
   */
  const isStepCompleted = (step: number) => {
    return completedSteps.has(step)
  }

  /**
   * Получение прогресса в процентах
   */
  const getProgress = () => {
    return ((currentStep + 1) / steps.length) * 100
  }

  return {
    ...form,
    // Состояние шагов
    currentStep,
    currentStepName,
    steps,
    isFirstStep,
    isLastStep,
    completedSteps,
    
    // Действия
    nextStep,
    prevStep,
    goToStep,
    
    // Утилиты
    isStepCompleted,
    getProgress,
  }
}

/**
 * Хук для работы с формами с автосохранением
 */
export function useFormWithAutoSave<TFieldValues extends FieldValues = FieldValues>(
  key: string,
  props?: UseFormProps<TFieldValues>,
  options?: {
    saveDelay?: number
    excludeFields?: (keyof TFieldValues)[]
  }
) {
  const form = useForm<TFieldValues>(props)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Сохранение данных в localStorage
   */
  const saveToStorage = (data: TFieldValues) => {
    try {
      const filteredData = { ...data }
      
      // Исключаем указанные поля
      if (options?.excludeFields) {
        options.excludeFields.forEach(field => {
          delete filteredData[field]
        })
      }
      
      localStorage.setItem(`form_${key}`, JSON.stringify(filteredData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save form data:', error)
    }
  }

  /**
   * Загрузка данных из localStorage
   */
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(`form_${key}`)
      if (saved) {
        const data = JSON.parse(saved)
        Object.keys(data).forEach(key => {
          form.setValue(key as any, data[key])
        })
        return data
      }
    } catch (error) {
      console.error('Failed to load form data:', error)
    }
    return null
  }

  /**
   * Очистка сохраненных данных
   */
  const clearSaved = () => {
    try {
      localStorage.removeItem(`form_${key}`)
      setLastSaved(null)
    } catch (error) {
      console.error('Failed to clear saved form data:', error)
    }
  }

  /**
   * Автосохранение с задержкой
   */
  const autoSave = () => {
    setIsSaving(true)
    const data = form.getValues()
    
    setTimeout(() => {
      saveToStorage(data)
      setIsSaving(false)
    }, options?.saveDelay || 1000)
  }

  return {
    ...form,
    // Состояние автосохранения
    lastSaved,
    isSaving,
    
    // Действия
    saveToStorage,
    loadFromStorage,
    clearSaved,
    autoSave,
  }
}

/**
 * Хук для работы с динамическими полями (массивы)
 */
export function useDynamicFields<TFieldValues extends FieldValues = FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fieldName: keyof TFieldValues
) {
  /**
   * Добавление нового поля
   */
  const addField = (defaultValue?: any) => {
    const currentValues = form.getValues(fieldName as any) || []
    const newValues = [...currentValues, defaultValue || {}]
    form.setValue(fieldName as any, newValues)
  }

  /**
   * Удаление поля по индексу
   */
  const removeField = (index: number) => {
    const currentValues = form.getValues(fieldName as any) || []
    const newValues = currentValues.filter((_: any, i: number) => i !== index)
    form.setValue(fieldName as any, newValues)
  }

  /**
   * Перемещение поля
   */
  const moveField = (fromIndex: number, toIndex: number) => {
    const currentValues = form.getValues(fieldName as any) || []
    const newValues = [...currentValues]
    const [removed] = newValues.splice(fromIndex, 1)
    newValues.splice(toIndex, 0, removed)
    form.setValue(fieldName as any, newValues)
  }

  /**
   * Получение значений полей
   */
  const getFields = () => {
    return form.getValues(fieldName as any) || []
  }

  /**
   * Очистка всех полей
   */
  const clearFields = () => {
    form.setValue(fieldName as any, [])
  }

  return {
    addField,
    removeField,
    moveField,
    getFields,
    clearFields,
  }
}

/**
 * Утилиты для работы с формами
 */
export const formUtils = {
  /**
   * Создание обработчика для поля с debounce
   */
  createDebouncedHandler: (handler: (value: any) => void, delay = 300) => {
    let timeoutId: NodeJS.Timeout
    
    return (value: any) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => handler(value), delay)
    }
  },

  /**
   * Преобразование ошибок API в ошибки формы
   */
  setApiErrors: <TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
    errors: Record<string, string | string[]>
  ) => {
    Object.entries(errors).forEach(([field, message]) => {
      const errorMessage = Array.isArray(message) ? message[0] : message
      form.setError(field as any, {
        type: 'server',
        message: errorMessage,
      })
    })
  },

  /**
   * Очистка всех ошибок формы
   */
  clearAllErrors: <TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>
  ) => {
    form.clearErrors()
  },

  /**
   * Проверка, есть ли изменения в форме
   */
  hasChanges: <TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
    initialValues: TFieldValues
  ): boolean => {
    const currentValues = form.getValues()
    return JSON.stringify(currentValues) !== JSON.stringify(initialValues)
  },

  /**
   * Сброс формы к начальным значениям
   */
  resetToInitial: <TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
    initialValues: TFieldValues
  ) => {
    form.reset(initialValues)
  },
}