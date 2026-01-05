import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHookWithProviders, createTestQueryClient } from '../utils'
import { createTestUser, createTestUsersList, createTestApiError } from '../factories'
import { useUsers, useCreateUser } from '@/hooks/api/useUsers'
import { apiTestUtils } from '../utils'

/**
 * Пример тестирования хука для запросов
 */
describe('useUsers', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('fetches users successfully', async () => {
    const mockUsers = createTestUsersList({ users: [createTestUser(), createTestUser()] })
    
    // Мокируем API ответ
    const mockFetch = apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse(mockUsers)
    )

    const { result } = renderHookWithProviders(
      () => useUsers({ page: 1, limit: 10 }),
      { queryClient }
    )

    // Проверяем начальное состояние
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()

    // Ждем завершения запроса
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Проверяем успешный результат
    expect(result.current.data).toEqual(mockUsers)
    expect(result.current.error).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({
        searchParams: expect.any(URLSearchParams)
      })
    )
  })

  it('handles API error', async () => {
    const mockError = createTestApiError({ message: 'Failed to fetch users', status: 500 })
    
    apiTestUtils.mockFetch(
      apiTestUtils.mockErrorResponse(mockError.status, mockError.message)
    )

    const { result } = renderHookWithProviders(
      () => useUsers(),
      { queryClient }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
    expect(result.current.isError).toBe(true)
  })

  it('applies filters correctly', async () => {
    const mockUsers = createTestUsersList()
    const mockFetch = apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse(mockUsers)
    )

    const filters = {
      search: 'john',
      role: 'admin',
      page: 2,
      limit: 5,
    }

    renderHookWithProviders(
      () => useUsers(filters),
      { queryClient }
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          searchParams: expect.any(URLSearchParams)
        })
      )
    })

    // Проверяем, что параметры переданы правильно
    const call = mockFetch.mock.calls[0]
    const searchParams = call[1].searchParams
    expect(searchParams.get('search')).toBe('john')
    expect(searchParams.get('role')).toBe('admin')
    expect(searchParams.get('page')).toBe('2')
    expect(searchParams.get('limit')).toBe('5')
  })

  it('caches data correctly', async () => {
    const mockUsers = createTestUsersList()
    const mockFetch = apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse(mockUsers)
    )

    const { result, rerender } = renderHookWithProviders(
      () => useUsers({ page: 1 }),
      { queryClient }
    )

    // Ждем первый запрос
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Перерендериваем с теми же параметрами
    rerender()

    // Данные должны быть взяты из кеша, новый запрос не должен быть сделан
    expect(result.current.data).toEqual(mockUsers)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('refetches when filters change', async () => {
    const mockUsers1 = createTestUsersList()
    const mockUsers2 = createTestUsersList()
    
    const mockFetch = apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse(mockUsers1)
    )

    const { result, rerender } = renderHookWithProviders(
      ({ filters }) => useUsers(filters),
      { 
        queryClient,
        initialProps: { filters: { page: 1 } }
      }
    )

    // Ждем первый запрос
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Меняем фильтры
    mockFetch.mockResolvedValueOnce(apiTestUtils.mockSuccessResponse(mockUsers2))
    rerender({ filters: { page: 2 } })

    // Должен быть сделан новый запрос
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})

/**
 * Пример тестирования хука для мутаций
 */
describe('useCreateUser', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('creates user successfully', async () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      role: 'user' as const,
    }
    const createdUser = createTestUser(newUserData)
    
    const mockFetch = apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse({ user: createdUser })
    )

    const { result } = renderHookWithProviders(
      () => useCreateUser(),
      { queryClient }
    )

    // Проверяем начальное состояние
    expect(result.current.isPending).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()

    // Выполняем мутацию
    result.current.mutate(newUserData)

    // Проверяем состояние во время выполнения
    expect(result.current.isPending).toBe(true)

    // Ждем завершения
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Проверяем результат
    expect(result.current.data).toEqual(createdUser)
    expect(result.current.error).toBeNull()
    expect(result.current.isSuccess).toBe(true)
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({
        method: 'POST',
        json: newUserData,
      })
    )
  })

  it('handles creation error', async () => {
    const newUserData = {
      name: 'New User',
      email: 'invalid-email',
      role: 'user' as const,
    }
    const mockError = createTestApiError({ 
      message: 'Validation failed', 
      status: 422 
    })
    
    apiTestUtils.mockFetch(
      apiTestUtils.mockErrorResponse(mockError.status, mockError.message)
    )

    const { result } = renderHookWithProviders(
      () => useCreateUser(),
      { queryClient }
    )

    // Выполняем мутацию
    result.current.mutate(newUserData)

    // Ждем завершения
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Проверяем ошибку
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
    expect(result.current.isError).toBe(true)
  })

  it('invalidates cache after successful creation', async () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      role: 'user' as const,
    }
    const createdUser = createTestUser(newUserData)
    
    apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse({ user: createdUser })
    )

    // Мокируем invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(
      () => useCreateUser(),
      { queryClient }
    )

    // Выполняем мутацию
    result.current.mutate(newUserData)

    // Ждем завершения
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Проверяем, что кеш был инвалидирован
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(['users'])
      })
    )
  })

  it('calls onSuccess callback', async () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      role: 'user' as const,
    }
    const createdUser = createTestUser(newUserData)
    const onSuccessMock = vi.fn()
    
    apiTestUtils.mockFetch(
      apiTestUtils.mockSuccessResponse({ user: createdUser })
    )

    const { result } = renderHookWithProviders(
      () => useCreateUser(),
      { queryClient }
    )

    // Выполняем мутацию с колбеком
    result.current.mutate(newUserData, {
      onSuccess: onSuccessMock,
    })

    // Ждем завершения
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Проверяем, что колбек был вызван
    expect(onSuccessMock).toHaveBeenCalledWith(
      createdUser,
      newUserData,
      expect.any(Object)
    )
  })

  it('calls onError callback', async () => {
    const newUserData = {
      name: 'New User',
      email: 'invalid-email',
      role: 'user' as const,
    }
    const onErrorMock = vi.fn()
    
    apiTestUtils.mockFetch(
      apiTestUtils.mockErrorResponse(422, 'Validation failed')
    )

    const { result } = renderHookWithProviders(
      () => useCreateUser(),
      { queryClient }
    )

    // Выполняем мутацию с колбеком
    result.current.mutate(newUserData, {
      onError: onErrorMock,
    })

    // Ждем завершения
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Проверяем, что колбек был вызван
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      newUserData,
      expect.any(Object)
    )
  })
})