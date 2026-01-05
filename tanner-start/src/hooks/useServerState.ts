import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'

/**
 * Типы для серверного состояния
 */
export interface ServerStateOptions<TData, TError = Error> {
    queryKey: QueryKey
    queryFn: () => Promise<TData>
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
}

export interface ServerMutationOptions<TData, TVariables, TError = Error> {
    mutationFn: (variables: TVariables) => Promise<TData>
    options?: UseMutationOptions<TData, TError, TVariables>
}

export interface InfiniteQueryOptions<TData, TError = Error> {
    queryKey: QueryKey
    queryFn: ({ pageParam }: { pageParam: number }) => Promise<TData>
    getNextPageParam: (lastPage: TData, allPages: TData[]) => number | undefined
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
}

/**
 * Хук для работы с серверным состоянием с дополнительными утилитами
 */
export function useServerState<TData, TError = Error>({
    queryKey,
    queryFn,
    options,
}: ServerStateOptions<TData, TError>) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey,
        queryFn,
        ...options,
    })

    // Утилиты для работы с кешем
    const utils = {
        // Инвалидация данных
        invalidate: useCallback(() => {
            return queryClient.invalidateQueries({ queryKey })
        }, [queryClient, queryKey]),

        // Рефетч данных
        refetch: useCallback(() => {
            return query.refetch()
        }, [query]),

        // Установка данных в кеш
        setData: useCallback((data: TData | ((old: TData | undefined) => TData)) => {
            queryClient.setQueryData(queryKey, data)
        }, [queryClient, queryKey]),

        // Получение данных из кеша
        getData: useCallback((): TData | undefined => {
            return queryClient.getQueryData(queryKey)
        }, [queryClient, queryKey]),

        // Удаление из кеша
        remove: useCallback(() => {
            queryClient.removeQueries({ queryKey })
        }, [queryClient, queryKey]),

        // Предварительная загрузка
        prefetch: useCallback(() => {
            return queryClient.prefetchQuery({ queryKey, queryFn })
        }, [queryClient, queryKey, queryFn]),

        // Отмена запроса
        cancel: useCallback(() => {
            return queryClient.cancelQueries({ queryKey })
        }, [queryClient, queryKey]),
    }

    return {
        ...query,
        utils,
    }
}

/**
 * Хук для мутаций с дополнительными утилитами
 */
export function useServerMutation<TData, TVariables, TError = Error>({
    mutationFn,
    options,
}: ServerMutationOptions<TData, TVariables, TError>) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn,
        ...options,
    })

    // Утилиты для работы с кешем после мутации
    const utils = {
        // Инвалидация связанных запросов
        invalidateQueries: useCallback((queryKey: QueryKey) => {
            return queryClient.invalidateQueries({ queryKey })
        }, [queryClient]),

        // Обновление данных в кеше
        updateQueryData: useCallback(<T>(queryKey: QueryKey, updater: (old: T | undefined) => T) => {
            queryClient.setQueryData(queryKey, updater)
        }, [queryClient]),

        // Оптимистичное обновление
        optimisticUpdate: useCallback(<T>(
            queryKey: QueryKey,
            updater: (old: T | undefined) => T,
            rollback?: (old: T | undefined) => T
        ) => {
            // Отменяем активные запросы
            queryClient.cancelQueries({ queryKey })

            // Сохраняем предыдущие данные
            const previousData = queryClient.getQueryData<T>(queryKey)

            // Применяем оптимистичное обновление
            queryClient.setQueryData(queryKey, updater)

            return {
                rollback: () => {
                    if (rollback && previousData !== undefined) {
                        queryClient.setQueryData(queryKey, rollback(previousData))
                    } else {
                        queryClient.setQueryData(queryKey, previousData)
                    }
                },
                previousData,
            }
        }, [queryClient]),
    }

    return {
        ...mutation,
        utils,
    }
}

/**
 * Хук для бесконечных запросов (пагинация)
 */
export function useInfiniteServerState<TData, TError = Error>({
    queryKey,
    queryFn,
    getNextPageParam,
    options,
}: InfiniteQueryOptions<TData, TError>) {
    const queryClient = useQueryClient()

    const query = useInfiniteQuery({
        queryKey,
        queryFn,
        getNextPageParam,
        initialPageParam: 1,
        ...options,
    })

    // Утилиты для работы с бесконечными запросами
    const utils = {
        // Инвалидация данных
        invalidate: useCallback(() => {
            return queryClient.invalidateQueries({ queryKey })
        }, [queryClient, queryKey]),

        // Сброс к первой странице
        reset: useCallback(() => {
            queryClient.resetQueries({ queryKey })
        }, [queryClient, queryKey]),

        // Загрузка следующей страницы
        fetchNextPage: useCallback(() => {
            return query.fetchNextPage()
        }, [query]),

        // Проверка наличия следующей страницы
        hasNextPage: query.hasNextPage,

        // Загрузка следующей страницы
        isFetchingNextPage: query.isFetchingNextPage,

        // Все данные в плоском виде
        flatData: query.data?.pages.flat() || [],
    }

    return {
        ...query,
        utils,
    }
}

/**
 * Хук для синхронизации серверного и локального состояния
 */
export function useSyncedState<TData>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    localState: TData,
    setLocalState: (data: TData) => void
) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey,
        queryFn,
        onSuccess: (data) => {
            // Синхронизируем с локальным состоянием
            setLocalState(data)
        },
    })

    // Функция для обновления и серверного, и локального состояния
    const updateBoth = useCallback((data: TData) => {
        // Обновляем локальное состояние немедленно
        setLocalState(data)

        // Обновляем кеш
        queryClient.setQueryData(queryKey, data)
    }, [queryClient, queryKey, setLocalState])

    return {
        ...query,
        localState,
        updateBoth,
    }
}

/**
 * Хук для работы с зависимыми запросами
 */
export function useDependentQueries<T1, T2>(
    firstQuery: {
        queryKey: QueryKey
        queryFn: () => Promise<T1>
        options?: UseQueryOptions<T1>
    },
    secondQuery: {
        queryKey: QueryKey
        queryFn: (firstResult: T1) => Promise<T2>
        options?: UseQueryOptions<T2>
    }
) {
    const first = useQuery({
        ...firstQuery.options,
        queryKey: firstQuery.queryKey,
        queryFn: firstQuery.queryFn,
    })

    const second = useQuery({
        ...secondQuery.options,
        queryKey: [...secondQuery.queryKey, first.data],
        queryFn: () => secondQuery.queryFn(first.data!),
        enabled: !!first.data && (secondQuery.options?.enabled ?? true),
    })

    return {
        first,
        second,
        isLoading: first.isLoading || second.isLoading,
        isError: first.isError || second.isError,
        error: first.error || second.error,
    }
}

/**
 * Хук для работы с параллельными запросами
 */
export function useParallelQueries<T extends Record<string, any>>(
    queries: {
        [K in keyof T]: {
            queryKey: QueryKey
            queryFn: () => Promise<T[K]>
            options?: UseQueryOptions<T[K]>
        }
    }
) {
    const results = {} as {
        [K in keyof T]: ReturnType<typeof useQuery<T[K]>>
    }

    for (const [key, query] of Object.entries(queries)) {
        results[key as keyof T] = useQuery({
            ...query.options,
            queryKey: query.queryKey,
            queryFn: query.queryFn,
        })
    }

    const isLoading = Object.values(results).some(result => result.isLoading)
    const isError = Object.values(results).some(result => result.isError)
    const errors = Object.values(results)
        .map(result => result.error)
        .filter(Boolean)

    return {
        results,
        isLoading,
        isError,
        errors,
        data: Object.fromEntries(
            Object.entries(results).map(([key, result]) => [key, result.data])
        ) as { [K in keyof T]: T[K] | undefined },
    }
}