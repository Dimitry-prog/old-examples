import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { QueryKey, UseMutationOptions } from '@tanstack/react-query'

/**
 * Типы для оптимистичных мутаций
 */
export interface OptimisticMutationOptions<TData, TVariables, TError = Error> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: QueryKey
  optimisticUpdate: (variables: TVariables, oldData: TData | undefined) => TData
  rollback?: (oldData: TData | undefined) => TData
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: TError, variables: TVariables, context: any) => void
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'onMutate' | 'onError' | 'onSuccess' | 'onSettled'>
}

/**
 * Хук для оптимистичных мутаций
 */
export function useOptimisticMutation<TData, TVariables, TError = Error>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  rollback,
  onSuccess,
  onError,
  options,
}: OptimisticMutationOptions<TData, TVariables, TError>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Отменяем все активные запросы для этого ключа
      await queryClient.cancelQueries({ queryKey })

      // Сохраняем предыдущие данные
      const previousData = queryClient.getQueryData<TData>(queryKey)

      // Применяем оптимистичное обновление
      const optimisticData = optimisticUpdate(variables, previousData)
      queryClient.setQueryData(queryKey, optimisticData)

      // Возвращаем контекст для отката
      return { previousData }
    },
    onError: (error, variables, context) => {
      // Откатываем изменения
      if (context?.previousData !== undefined) {
        if (rollback) {
          queryClient.setQueryData(queryKey, rollback(context.previousData))
        } else {
          queryClient.setQueryData(queryKey, context.previousData)
        }
      }

      onError?.(error, variables, context)
    },
    onSuccess: (data, variables, context) => {
      // Обновляем данные реальными данными с сервера
      queryClient.setQueryData(queryKey, data)
      onSuccess?.(data, variables)
    },
    onSettled: () => {
      // Инвалидируем запросы для обеспечения консистентности
      queryClient.invalidateQueries({ queryKey })
    },
    ...options,
  })
}

/**
 * Хук для оптимистичного добавления элемента в список
 */
export function useOptimisticAdd<TItem, TVariables>({
  mutationFn,
  queryKey,
  getOptimisticItem,
  options,
}: {
  mutationFn: (variables: TVariables) => Promise<TItem>
  queryKey: QueryKey
  getOptimisticItem: (variables: TVariables) => TItem
  options?: Omit<UseMutationOptions<TItem, Error, TVariables>, 'mutationFn'>
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    optimisticUpdate: (variables, oldData: TItem[] | undefined) => {
      const optimisticItem = getOptimisticItem(variables)
      return oldData ? [...oldData, optimisticItem] : [optimisticItem]
    },
    rollback: (oldData) => oldData || [],
    options,
  })
}

/**
 * Хук для оптимистичного обновления элемента в списке
 */
export function useOptimisticUpdate<TItem extends { id: string }, TVariables extends { id: string }>({
  mutationFn,
  queryKey,
  getOptimisticItem,
  options,
}: {
  mutationFn: (variables: TVariables) => Promise<TItem>
  queryKey: QueryKey
  getOptimisticItem: (variables: TVariables, oldItem: TItem) => TItem
  options?: Omit<UseMutationOptions<TItem, Error, TVariables>, 'mutationFn'>
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    optimisticUpdate: (variables, oldData: TItem[] | undefined) => {
      if (!oldData) return []
      
      return oldData.map(item => 
        item.id === variables.id 
          ? getOptimisticItem(variables, item)
          : item
      )
    },
    rollback: (oldData) => oldData || [],
    options,
  })
}

/**
 * Хук для оптимистичного удаления элемента из списка
 */
export function useOptimisticDelete<TItem extends { id: string }>({
  mutationFn,
  queryKey,
  options,
}: {
  mutationFn: (id: string) => Promise<void>
  queryKey: QueryKey
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
}) {
  return useOptimisticMutation({
    mutationFn,
    queryKey,
    optimisticUpdate: (id, oldData: TItem[] | undefined) => {
      if (!oldData) return []
      return oldData.filter(item => item.id !== id)
    },
    rollback: (oldData) => oldData || [],
    options,
  })
}

/**
 * Хук для группировки нескольких оптимистичных мутаций
 */
export function useOptimisticBatch() {
  const queryClient = useQueryClient()

  const executeBatch = useCallback(async (
    mutations: Array<{
      queryKey: QueryKey
      optimisticUpdate: (oldData: any) => any
      mutationFn: () => Promise<any>
      rollback?: (oldData: any) => any
    }>
  ) => {
    // Сохраняем все предыдущие данные
    const previousDataMap = new Map()
    
    try {
      // Отменяем все активные запросы
      await Promise.all(
        mutations.map(({ queryKey }) => 
          queryClient.cancelQueries({ queryKey })
        )
      )

      // Применяем все оптимистичные обновления
      mutations.forEach(({ queryKey, optimisticUpdate }) => {
        const previousData = queryClient.getQueryData(queryKey)
        previousDataMap.set(queryKey, previousData)
        
        const optimisticData = optimisticUpdate(previousData)
        queryClient.setQueryData(queryKey, optimisticData)
      })

      // Выполняем все мутации
      const results = await Promise.all(
        mutations.map(({ mutationFn }) => mutationFn())
      )

      // Инвалидируем все затронутые запросы
      await Promise.all(
        mutations.map(({ queryKey }) => 
          queryClient.invalidateQueries({ queryKey })
        )
      )

      return results
    } catch (error) {
      // Откатываем все изменения при ошибке
      mutations.forEach(({ queryKey, rollback }) => {
        const previousData = previousDataMap.get(queryKey)
        if (previousData !== undefined) {
          if (rollback) {
            queryClient.setQueryData(queryKey, rollback(previousData))
          } else {
            queryClient.setQueryData(queryKey, previousData)
          }
        }
      })

      throw error
    }
  }, [queryClient])

  return { executeBatch }
}

/**
 * Хук для отслеживания состояния мутаций
 */
export function useMutationState() {
  const queryClient = useQueryClient()

  const getMutationState = useCallback(() => {
    const mutationCache = queryClient.getMutationCache()
    const mutations = mutationCache.getAll()

    return {
      total: mutations.length,
      pending: mutations.filter(m => m.state.status === 'pending').length,
      success: mutations.filter(m => m.state.status === 'success').length,
      error: mutations.filter(m => m.state.status === 'error').length,
      idle: mutations.filter(m => m.state.status === 'idle').length,
      mutations: mutations.map(m => ({
        id: m.mutationId,
        status: m.state.status,
        variables: m.state.variables,
        data: m.state.data,
        error: m.state.error,
        isPaused: m.state.isPaused,
      })),
    }
  }, [queryClient])

  return {
    getMutationState,
    clearMutations: useCallback(() => {
      queryClient.getMutationCache().clear()
    }, [queryClient]),
  }
}