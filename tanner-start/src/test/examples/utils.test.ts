import { describe, it, expect, vi } from 'vitest'
import { validationUtils } from '@/lib/validation'
import { cn } from '@/lib/utils'
import { loginSchema } from '@/lib/formSchemas'
import { z } from 'zod'

/**
 * Пример тестирования утилит валидации
 */
describe('validationUtils', () => {
  describe('validate', () => {
    const testSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email format'),
      age: z.number().min(18, 'Must be at least 18 years old'),
    })

    it('validates correct data successfully', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      }

      const result = validationUtils.validate(testSchema, validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('returns validation errors for invalid data', () => {
      const invalidData = {
        name: 'J',
        email: 'invalid-email',
        age: 16,
      }

      const result = validationUtils.validate(testSchema, invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError)
        expect(result.formattedError).toBeDefined()
      }
    })

    it('handles missing required fields', () => {
      const incompleteData = {
        name: 'John',
      }

      const result = validationUtils.validate(testSchema, incompleteData)

      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = validationUtils.getFieldErrors(result.error)
        expect(fieldErrors.email).toContain('Required')
        expect(fieldErrors.age).toContain('Required')
      }
    })
  })

  describe('getFieldErrors', () => {
    it('extracts field errors from ZodError', () => {
      const schema = z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(8, 'Password too short'),
      })

      const result = schema.safeParse({
        email: 'invalid',
        password: '123',
      })

      if (!result.success) {
        const fieldErrors = validationUtils.getFieldErrors(result.error)
        
        expect(fieldErrors.email).toContain('Invalid email')
        expect(fieldErrors.password).toContain('Password too short')
      }
    })

    it('handles nested field errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2, 'Name too short'),
          }),
        }),
      })

      const result = schema.safeParse({
        user: {
          profile: {
            name: 'J',
          },
        },
      })

      if (!result.success) {
        const fieldErrors = validationUtils.getFieldErrors(result.error)
        expect(fieldErrors['user.profile.name']).toContain('Name too short')
      }
    })
  })

  describe('getFirstError', () => {
    it('returns first error message', () => {
      const schema = z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(8, 'Password too short'),
      })

      const result = schema.safeParse({
        email: 'invalid',
        password: '123',
      })

      if (!result.success) {
        const firstError = validationUtils.getFirstError(result.error)
        expect(typeof firstError).toBe('string')
        expect(firstError.length).toBeGreaterThan(0)
      }
    })
  })

  describe('createFieldSchema', () => {
    it('creates schema for specific field', () => {
      const fullSchema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        age: z.number(),
      })

      const emailSchema = validationUtils.createFieldSchema(fullSchema, 'email')
      
      expect(emailSchema.safeParse('valid@email.com').success).toBe(true)
      expect(emailSchema.safeParse('invalid-email').success).toBe(false)
    })
  })
})

/**
 * Пример тестирования утилит для классов CSS
 */
describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('base-class', 'additional-class')
    expect(result).toBe('base-class additional-class')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    )
    
    expect(result).toBe('base-class active')
  })

  it('handles Tailwind class conflicts', () => {
    const result = cn('p-4 p-2', 'bg-red-500 bg-blue-500')
    
    // Последние классы должны иметь приоритет
    expect(result).toContain('p-2')
    expect(result).toContain('bg-blue-500')
    expect(result).not.toContain('p-4')
    expect(result).not.toContain('bg-red-500')
  })

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], ['class3', 'class4'])
    expect(result).toBe('class1 class2 class3 class4')
  })

  it('filters out falsy values', () => {
    const result = cn('class1', null, undefined, false, '', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    })
    
    expect(result).toBe('class1 class3')
  })
})

/**
 * Пример тестирования схем валидации форм
 */
describe('Form Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        remember: true,
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires email field', () => {
      const invalidData = {
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const errors = result.error.flatten()
        expect(errors.fieldErrors.email).toBeDefined()
      }
    })

    it('validates email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const errors = result.error.flatten()
        expect(errors.fieldErrors.email).toContain('Некорректный формат email')
      }
    })

    it('requires password field', () => {
      const invalidData = {
        email: 'user@example.com',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const errors = result.error.flatten()
        expect(errors.fieldErrors.password).toBeDefined()
      }
    })

    it('makes remember field optional', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        // remember field is optional
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.remember).toBe(false) // default value
      }
    })
  })
})

/**
 * Пример тестирования асинхронных утилит
 */
describe('Async Utils', () => {
  it('handles async validation', async () => {
    const asyncSchema = z.string().refine(async (val) => {
      // Симуляция асинхронной проверки
      await new Promise(resolve => setTimeout(resolve, 10))
      return val !== 'forbidden'
    }, 'Value is forbidden')

    const validResult = await asyncSchema.safeParseAsync('allowed')
    expect(validResult.success).toBe(true)

    const invalidResult = await asyncSchema.safeParseAsync('forbidden')
    expect(invalidResult.success).toBe(false)
  })

  it('handles timeout in async operations', async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 100)
    })

    const fastPromise = new Promise(resolve => {
      setTimeout(() => resolve('success'), 50)
    })

    const result = await Promise.race([fastPromise, timeoutPromise])
    expect(result).toBe('success')
  })
})

/**
 * Пример тестирования обработки ошибок
 */
describe('Error Handling', () => {
  it('handles validation errors gracefully', () => {
    const schema = z.object({
      required: z.string(),
    })

    expect(() => {
      const result = schema.parse({})
      // Этот код не должен выполниться
      expect(result).toBeUndefined()
    }).toThrow()
  })

  it('provides detailed error information', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    })

    try {
      schema.parse({
        email: 'invalid',
        age: 16,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        expect(error.issues).toHaveLength(2)
        expect(error.issues[0].path).toEqual(['email'])
        expect(error.issues[1].path).toEqual(['age'])
      }
    }
  })

  it('handles custom error messages', () => {
    const schema = z.string().min(5, 'Custom error message')

    const result = schema.safeParse('abc')
    expect(result.success).toBe(false)
    
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Custom error message')
    }
  })
})