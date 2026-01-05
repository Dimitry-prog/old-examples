import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm, useMultiStepForm, formUtils } from '../useForm'

/**
 * Тесты для хука useForm
 */
describe('useForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => 
      useForm({
        defaultValues: {
          name: 'John',
          email: 'john@example.com'
        }
      })
    )

    expect(result.current.getValues()).toEqual({
      name: 'John',
      email: 'john@example.com'
    })
  })

  it('should handle form submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useForm())

    await act(async () => {
      const handler = result.current.handleSubmitWithError(onSubmit)
      await handler({})
    })

    expect(onSubmit).toHaveBeenCalledWith({})
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should handle submission errors', async () => {
    const error = new Error('Submission failed')
    const onSubmit = vi.fn().mockRejectedValue(error)
    
    const { result } = renderHook(() => useForm())

    await act(async () => {
      const handler = result.current.handleSubmitWithError(onSubmit)
      await handler({})
    })

    expect(result.current.submitError).toBe('Submission failed')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should set loading state during submission', async () => {
    const onSubmit = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    const { result } = renderHook(() => useForm())

    act(() => {
      const handler = result.current.handleSubmitWithError(onSubmit)
      handler({})
    })

    expect(result.current.isSubmitting).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    expect(result.current.isSubmitting).toBe(false)
  })

  it('should clear submit error', () => {
    const { result } = renderHook(() => useForm())

    act(() => {
      result.current.setSubmitError('Test error')
    })

    expect(result.current.submitError).toBe('Test error')

    act(() => {
      result.current.setSubmitError(null)
    })

    expect(result.current.submitError).toBeNull()
  })
})

/**
 * Тесты для многошагового хука
 */
describe('useMultiStepForm', () => {
  const steps = ['personal', 'contact', 'confirmation']

  it('should initialize with first step', () => {
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: { name: '', email: '' }
      })
    )

    expect(result.current.currentStep).toBe(0)
    expect(result.current.currentStepName).toBe('personal')
    expect(result.current.isFirstStep).toBe(true)
    expect(result.current.isLastStep).toBe(false)
  })

  it('should navigate between steps', async () => {
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: { name: 'John', email: 'john@example.com' }
      })
    )

    // Переход к следующему шагу
    await act(async () => {
      await result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.currentStepName).toBe('contact')
    expect(result.current.isFirstStep).toBe(false)
    expect(result.current.isLastStep).toBe(false)

    // Возврат к предыдущему шагу
    act(() => {
      result.current.prevStep()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.currentStepName).toBe('personal')
  })

  it('should track completed steps', async () => {
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: { name: 'John', email: 'john@example.com' }
      })
    )

    expect(result.current.isStepCompleted(0)).toBe(false)

    await act(async () => {
      await result.current.nextStep()
    })

    expect(result.current.isStepCompleted(0)).toBe(true)
    expect(result.current.isStepCompleted(1)).toBe(false)
  })

  it('should calculate progress correctly', async () => {
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: { name: 'John', email: 'john@example.com' }
      })
    )

    expect(result.current.getProgress()).toBeCloseTo(33.33, 2) // 1/3 * 100

    await act(async () => {
      await result.current.nextStep()
    })

    expect(result.current.getProgress()).toBeCloseTo(66.67, 2) // 2/3 * 100
  })

  it('should go to specific step', () => {
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: { name: 'John', email: 'john@example.com' }
      })
    )

    act(() => {
      result.current.goToStep(2)
    })

    expect(result.current.currentStep).toBe(2)
    expect(result.current.currentStepName).toBe('confirmation')
    expect(result.current.isLastStep).toBe(true)
  })

  it('should not go beyond step bounds', () => {
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: { name: 'John', email: 'john@example.com' }
      })
    )

    // Попытка перейти к несуществующему шагу
    act(() => {
      result.current.goToStep(10)
    })

    expect(result.current.currentStep).toBe(0) // Должен остаться на первом шаге

    act(() => {
      result.current.goToStep(-1)
    })

    expect(result.current.currentStep).toBe(0) // Должен остаться на первом шаге
  })
})

/**
 * Тесты для утилит форм
 */
describe('formUtils', () => {
  describe('createDebouncedHandler', () => {
    it('should debounce function calls', async () => {
      const handler = vi.fn()
      const debouncedHandler = formUtils.createDebouncedHandler(handler, 100)

      // Быстрые вызовы
      debouncedHandler('call1')
      debouncedHandler('call2')
      debouncedHandler('call3')

      // Функция не должна быть вызвана сразу
      expect(handler).not.toHaveBeenCalled()

      // Ждем debounce delay
      await new Promise(resolve => setTimeout(resolve, 150))

      // Функция должна быть вызвана только один раз с последним значением
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith('call3')
    })
  })

  describe('hasChanges', () => {
    it('should detect changes in form data', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const currentValues = { name: 'Jane', email: 'john@example.com' }

      const mockForm = {
        getValues: () => currentValues
      } as any

      const hasChanges = formUtils.hasChanges(mockForm, initialValues)
      expect(hasChanges).toBe(true)
    })

    it('should return false when no changes', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const currentValues = { name: 'John', email: 'john@example.com' }

      const mockForm = {
        getValues: () => currentValues
      } as any

      const hasChanges = formUtils.hasChanges(mockForm, initialValues)
      expect(hasChanges).toBe(false)
    })
  })

  describe('setApiErrors', () => {
    it('should set API errors on form', () => {
      const setError = vi.fn()
      const mockForm = { setError } as any

      const apiErrors = {
        email: 'Email is already taken',
        name: ['Name is required', 'Name is too short']
      }

      formUtils.setApiErrors(mockForm, apiErrors)

      expect(setError).toHaveBeenCalledWith('email', {
        type: 'server',
        message: 'Email is already taken'
      })

      expect(setError).toHaveBeenCalledWith('name', {
        type: 'server',
        message: 'Name is required'
      })
    })
  })

  describe('clearAllErrors', () => {
    it('should clear all form errors', () => {
      const clearErrors = vi.fn()
      const mockForm = { clearErrors } as any

      formUtils.clearAllErrors(mockForm)

      expect(clearErrors).toHaveBeenCalledOnce()
    })
  })

  describe('resetToInitial', () => {
    it('should reset form to initial values', () => {
      const reset = vi.fn()
      const mockForm = { reset } as any
      const initialValues = { name: 'John', email: 'john@example.com' }

      formUtils.resetToInitial(mockForm, initialValues)

      expect(reset).toHaveBeenCalledWith(initialValues)
    })
  })
})

/**
 * Интеграционные тесты
 */
describe('Form Integration', () => {
  it('should work with real form workflow', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    
    const { result } = renderHook(() => 
      useForm({
        defaultValues: {
          name: '',
          email: ''
        }
      })
    )

    // Устанавливаем значения
    act(() => {
      result.current.setValue('name', 'John Doe')
      result.current.setValue('email', 'john@example.com')
    })

    // Проверяем значения
    expect(result.current.getValues()).toEqual({
      name: 'John Doe',
      email: 'john@example.com'
    })

    // Отправляем форму
    await act(async () => {
      const handler = result.current.handleSubmitWithError(onSubmit)
      await handler(result.current.getValues())
    })

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    })
  })

  it('should handle complex multi-step workflow', async () => {
    const steps = ['step1', 'step2', 'step3']
    const { result } = renderHook(() => 
      useMultiStepForm(steps, {
        defaultValues: {
          step1Data: '',
          step2Data: '',
          step3Data: ''
        }
      })
    )

    // Заполняем данные первого шага
    act(() => {
      result.current.setValue('step1Data', 'Step 1 completed')
    })

    // Переходим ко второму шагу
    await act(async () => {
      await result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.isStepCompleted(0)).toBe(true)

    // Заполняем данные второго шага
    act(() => {
      result.current.setValue('step2Data', 'Step 2 completed')
    })

    // Переходим к третьему шагу
    await act(async () => {
      await result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(2)
    expect(result.current.isLastStep).toBe(true)

    // Проверяем финальные данные
    const finalData = result.current.getValues()
    expect(finalData).toEqual({
      step1Data: 'Step 1 completed',
      step2Data: 'Step 2 completed',
      step3Data: ''
    })
  })
})