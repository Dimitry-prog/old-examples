import { useForm as useReactHookForm, type UseFormProps, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { validationUtils, formValidationUtils } from '@/lib/validation'

/**
 * Хук для работы с формами с Zod валидацией
 */
export function useZodForm<TSchema extends z.ZodSchema<any>>(
  schema: TSchema,
  props?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
) {
  type FormData = z.infer<TSchema>
  
  const form = useReactHookForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...props,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Обработчик отправки формы с валидацией
   */
  const handleSubmitWithValidation = (
    onSubmit: (data: FormData) => Promise<void> | void,
    onError?: (errors: any) => void
  ) => {
    return form.handleSubmit(
      async (data) => {
        try {
          setIsSubmitting(true)
          setSubmitError(null)
          
          // Дополнительная валидация перед отправкой
          const validation = validationUtils.validate(schema, data)
          if (!validation.success) {
            throw new Error(validation.formattedError.message)
          }
          
          await onSubmit(validation.data)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при отправке формы'
          setSubmitError(errorMessage)
          console.error('Form submission error:', error)
        } finally {
          setIsSubmitting(false)
        }
      },
      (errors) => {
        console.error('Form validation errors:', errors)
        onError?.(errors)
      }
    )
  }

  /**
   * Валидация конкретного поля
   */
  const validateField = async (fieldName: keyof FormData, value: any) => {
    try {
      const fieldSchema = formValidationUtils.createFieldSchema(
        schema as z.ZodObject<any>,
        fieldName as string
      )
      
      await fieldSchema.parseAsync(value)
      form.clearErrors(fieldName as any)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = validationUtils.getFirstError(error)
        form.setError(fieldName as any, {
          type: 'validation',
          message: errorMessage,
        })
      }
      return false
    }
  }

  /**
   * Установка ошибок сервера
   */
  const setServerErrors = (errors: Record<string, string | string[]>) => {
    Object.entries(errors).forEach(([field, message]) => {
      const errorMessage = Array.isArray(message) ? message[0] : message
      form.setError(field as any, {
        type: 'server',
        message: errorMessage,
      })
    })
  }

  /**
   * Получение текущих данных с валидацией
   */
  const getValidatedData = (): FormData | null => {
    const data = form.getValues()
    const validation = validationUtils.validate(schema, data)
    
    if (validation.success) {
      return validation.data
    }
    
    console.error('Data validation failed:', validation.formattedError)
    return null
  }

  return {
    ...form,
    // Дополнительные методы
    handleSubmitWithValidation,
    validateField,
    setServerErrors,
    getValidatedData,
    
    // Состояние
    isSubmitting,
    submitError,
    setSubmitError,
    
    // Схема для внешнего использования
    schema,
  }
}

/**
 * Хук для многошаговых форм с Zod валидацией
 */
export function useZodMultiStepForm<TSchema extends z.ZodSchema<any>>(
  schema: TSchema,
  steps: string[],
  stepSchemas?: Record<string, z.ZodSchema<any>>,
  props?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
) {
  type FormData = z.infer<TSchema>
  
  const form = useZodForm(schema, props)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const currentStepName = steps[currentStep]

  /**
   * Валидация текущего шага
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    const stepSchema = stepSchemas?.[currentStepName]
    
    if (stepSchema) {
      const currentData = form.getValues()
      const validation = validationUtils.validate(stepSchema, currentData)
      
      if (!validation.success) {
        // Устанавливаем ошибки для полей текущего шага
        const fieldErrors = validationUtils.getFieldErrors(validation.error)
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: 'validation',
            message: messages[0],
          })
        })
        return false
      }
    }
    
    // Если нет схемы для шага, используем стандартную валидацию полей
    return await form.trigger()
  }

  /**
   * Переход к следующему шагу
   */
  const nextStep = async (): Promise<boolean> => {
    const isValid = await validateCurrentStep()
    
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
  const goToStep = async (step: number): Promise<boolean> => {
    if (step >= 0 && step < steps.length) {
      // Валидируем все предыдущие шаги
      for (let i = currentStep; i < step; i++) {
        const tempCurrentStep = i
        const stepSchema = stepSchemas?.[steps[tempCurrentStep]]
        
        if (stepSchema) {
          const currentData = form.getValues()
          const validation = validationUtils.validate(stepSchema, currentData)
          
          if (!validation.success) {
            return false
          }
        }
      }
      
      setCurrentStep(step)
      return true
    }
    
    return false
  }

  /**
   * Проверка, завершен ли шаг
   */
  const isStepCompleted = (step: number): boolean => {
    return completedSteps.has(step)
  }

  /**
   * Получение прогресса в процентах
   */
  const getProgress = (): number => {
    return ((currentStep + 1) / steps.length) * 100
  }

  /**
   * Получение ошибок для текущего шага
   */
  const getCurrentStepErrors = () => {
    const stepSchema = stepSchemas?.[currentStepName]
    if (!stepSchema) return {}

    const currentData = form.getValues()
    const validation = validationUtils.validate(stepSchema, currentData)
    
    if (!validation.success) {
      return validationUtils.getFieldErrors(validation.error)
    }
    
    return {}
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
    validateCurrentStep,
    
    // Утилиты
    isStepCompleted,
    getProgress,
    getCurrentStepErrors,
    
    // Схемы
    stepSchemas,
  }
}

/**
 * Хук для динамических форм с Zod валидацией
 */
export function useZodDynamicForm<TSchema extends z.ZodSchema<any>>(
  schema: TSchema,
  fieldName: string,
  itemSchema: z.ZodSchema<any>,
  props?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
) {
  const form = useZodForm(schema, props)

  /**
   * Добавление нового элемента с валидацией
   */
  const addItem = (defaultValue?: any) => {
    const validation = validationUtils.validate(itemSchema, defaultValue || {})
    const valueToAdd = validation.success ? validation.data : (defaultValue || {})
    
    const currentValues = form.getValues(fieldName as any) || []
    const newValues = [...currentValues, valueToAdd]
    form.setValue(fieldName as any, newValues)
    
    // Валидируем новый массив
    form.trigger(fieldName as any)
  }

  /**
   * Удаление элемента
   */
  const removeItem = (index: number) => {
    const currentValues = form.getValues(fieldName as any) || []
    const newValues = currentValues.filter((_: any, i: number) => i !== index)
    form.setValue(fieldName as any, newValues)
    
    // Валидируем обновленный массив
    form.trigger(fieldName as any)
  }

  /**
   * Валидация конкретного элемента
   */
  const validateItem = (index: number, value: any): boolean => {
    const validation = validationUtils.validate(itemSchema, value)
    
    if (!validation.success) {
      const errorMessage = validationUtils.getFirstError(validation.error)
      form.setError(`${fieldName}.${index}` as any, {
        type: 'validation',
        message: errorMessage,
      })
      return false
    }
    
    form.clearErrors(`${fieldName}.${index}` as any)
    return true
  }

  /**
   * Получение элементов
   */
  const getItems = () => {
    return form.getValues(fieldName as any) || []
  }

  /**
   * Валидация всех элементов
   */
  const validateAllItems = (): boolean => {
    const items = getItems()
    let isValid = true
    
    items.forEach((item: any, index: number) => {
      if (!validateItem(index, item)) {
        isValid = false
      }
    })
    
    return isValid
  }

  return {
    ...form,
    // Методы для работы с динамическими элементами
    addItem,
    removeItem,
    validateItem,
    getItems,
    validateAllItems,
    
    // Схемы
    itemSchema,
  }
}

/**
 * Утилиты для работы с Zod формами
 */
export const zodFormUtils = {
  /**
   * Создание схемы для шага многошаговой формы
   */
  createStepSchema: <T extends z.ZodRawShape>(
    fullSchema: z.ZodObject<T>,
    fields: (keyof T)[]
  ): z.ZodObject<Pick<T, keyof T & (keyof T)[]>> => {
    const stepShape = {} as Pick<T, keyof T & (keyof T)[]>
    
    fields.forEach(field => {
      if (field in fullSchema.shape) {
        stepShape[field as keyof typeof stepShape] = fullSchema.shape[field]
      }
    })
    
    return z.object(stepShape)
  },

  /**
   * Создание условной схемы валидации
   */
  createConditionalSchema: <T>(
    baseSchema: z.ZodSchema<T>,
    condition: (data: T) => boolean,
    conditionalSchema: z.ZodSchema<any>
  ) => {
    return baseSchema.refine(
      (data) => {
        if (condition(data)) {
          const result = conditionalSchema.safeParse(data)
          return result.success
        }
        return true
      },
      {
        message: 'Условная валидация не пройдена',
      }
    )
  },

  /**
   * Создание схемы с кастомными сообщениями об ошибках
   */
  withCustomMessages: <T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    messages: Partial<Record<keyof T, string>>
  ) => {
    const newShape = {} as T
    
    Object.keys(schema.shape).forEach(key => {
      const field = schema.shape[key]
      const customMessage = messages[key as keyof T]
      
      if (customMessage && field instanceof z.ZodString) {
        newShape[key as keyof T] = field.min(1, customMessage) as T[keyof T]
      } else {
        newShape[key as keyof T] = field
      }
    })
    
    return z.object(newShape)
  },
}