import { useState } from 'react'
import { 
  useServerState, 
  useOptimisticAdd, 
  useOptimisticUpdate, 
  useOptimisticDelete,
  useInfiniteServerState,
  useMutationState,
} from '@/hooks'
import { usersApi } from '@/lib/api'
import type { AuthUser } from '@/types'

/**
 * Пример использования серверного состояния с TanStack Query
 */
export function ServerStateExample() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Базовый пример использования серверного состояния
  const usersQuery = useServerState({
    queryKey: ['users', 'list'],
    queryFn: () => usersApi.getUsers(),
    options: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  })

  // Пример бесконечного запроса (пагинация)
  const infiniteUsersQuery = useInfiniteServerState({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam }) => usersApi.getUsers({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      // Предполагаем, что API возвращает hasMore или подобное поле
      return (lastPage as any).hasMore ? allPages.length + 1 : undefined
    },
    options: {
      staleTime: 1000 * 60 * 2,
    },
  })

  // Оптимистичные мутации
  const addUserMutation = useOptimisticAdd({
    mutationFn: usersApi.createUser,
    queryKey: ['users', 'list'],
    getOptimisticItem: (variables) => ({
      id: `temp-${Date.now()}`,
      email: variables.email,
      name: variables.name,
      role: variables.role || 'user',
      accessToken: '',
      refreshToken: '',
      ...variables,
    } as AuthUser),
  })

  const updateUserMutation = useOptimisticUpdate({
    mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
    queryKey: ['users', 'list'],
    getOptimisticItem: (variables, oldItem) => ({
      ...oldItem,
      ...variables.data,
    }),
  })

  const deleteUserMutation = useOptimisticDelete({
    mutationFn: usersApi.deleteUser,
    queryKey: ['users', 'list'],
  })

  // Состояние мутаций
  const mutationState = useMutationState()

  const handleAddUser = () => {
    addUserMutation.mutate({
      email: `user${Date.now()}@example.com`,
      name: `User ${Date.now()}`,
      role: 'user',
    })
  }

  const handleUpdateUser = (user: AuthUser) => {
    updateUserMutation.mutate({
      id: user.id,
      data: {
        name: `${user.name} (Updated)`,
      },
    })
  }

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Server State Examples</h2>
        <p className="text-muted-foreground mb-6">
          Демонстрация различных паттернов работы с серверным состоянием
        </p>
      </div>

      {/* Статистика мутаций */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Mutation State</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-600">
              {mutationState.getMutationState().total}
            </div>
          </div>
          <div>
            <div className="font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {mutationState.getMutationState().pending}
            </div>
          </div>
          <div>
            <div className="font-medium">Success</div>
            <div className="text-2xl font-bold text-green-600">
              {mutationState.getMutationState().success}
            </div>
          </div>
          <div>
            <div className="font-medium">Error</div>
            <div className="text-2xl font-bold text-red-600">
              {mutationState.getMutationState().error}
            </div>
          </div>
        </div>
      </div>

      {/* Управление кешем */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Cache Management</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => usersQuery.utils.invalidate()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Invalidate
          </button>
          <button
            onClick={() => usersQuery.utils.refetch()}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Refetch
          </button>
          <button
            onClick={() => usersQuery.utils.remove()}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Remove from Cache
          </button>
          <button
            onClick={() => usersQuery.utils.prefetch()}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            Prefetch
          </button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Status: {usersQuery.status} | 
          Fetching: {usersQuery.isFetching ? 'Yes' : 'No'} | 
          Stale: {usersQuery.isStale ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Список пользователей с оптимистичными обновлениями */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Users List (Optimistic Updates)</h3>
          <button
            onClick={handleAddUser}
            disabled={addUserMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {addUserMutation.isPending ? 'Adding...' : 'Add User'}
          </button>
        </div>

        {usersQuery.isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : usersQuery.isError ? (
          <div className="text-center py-8 text-red-600">
            Error: {usersQuery.error?.message}
          </div>
        ) : (
          <div className="space-y-2">
            {usersQuery.data?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">Role: {user.role}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateUser(user)}
                    disabled={updateUserMutation.isPending}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteUserMutation.isPending}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Бесконечный список */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Infinite Query Example</h3>
        
        {infiniteUsersQuery.isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              Total items: {infiniteUsersQuery.utils.flatData.length}
            </div>
            
            {infiniteUsersQuery.utils.flatData.slice(0, 5).map((user: any) => (
              <div key={user.id} className="p-2 border rounded">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            ))}
            
            {infiniteUsersQuery.utils.hasNextPage && (
              <button
                onClick={() => infiniteUsersQuery.utils.fetchNextPage()}
                disabled={infiniteUsersQuery.utils.isFetchingNextPage}
                className="w-full py-2 border border-dashed border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {infiniteUsersQuery.utils.isFetchingNextPage 
                  ? 'Loading more...' 
                  : 'Load More'
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}