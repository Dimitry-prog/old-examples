import { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useQueries'
import type { AuthUser } from '@/types'

/**
 * Пример компонента для демонстрации работы с TanStack Query
 * Показывает CRUD операции с пользователями
 */
export function UsersExample() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  // Получение списка пользователей
  const { 
    data: usersData, 
    isLoading, 
    error, 
    isFetching 
  } = useUsers({ page, limit: 10, search: search || undefined })
  
  // Мутации для CRUD операций
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        email: `user${Date.now()}@example.com`,
        name: `User ${Date.now()}`,
        role: 'user',
      })
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleUpdateUser = async (id: string) => {
    try {
      await updateUserMutation.mutateAsync({
        id,
        data: { name: `Updated User ${Date.now()}` }
      })
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить пользователя?')) {
      try {
        await deleteUserMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Загрузка пользователей...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">Ошибка загрузки</div>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Пользователи</h2>
        <button
          onClick={handleCreateUser}
          disabled={createUserMutation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {createUserMutation.isPending ? 'Создание...' : 'Создать пользователя'}
        </button>
      </div>

      {/* Поиск */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Поиск пользователей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
        />
        {isFetching && (
          <div className="text-sm text-muted-foreground">Обновление...</div>
        )}
      </div>

      {/* Список пользователей */}
      <div className="space-y-2">
        {usersData?.users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleUpdateUser(user.id)}
                disabled={updateUserMutation.isPending}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50"
              >
                {updateUserMutation.isPending ? 'Обновление...' : 'Обновить'}
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                disabled={deleteUserMutation.isPending}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 disabled:opacity-50"
              >
                {deleteUserMutation.isPending ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      {usersData && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Показано {usersData.users.length} из {usersData.total} пользователей
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-accent disabled:opacity-50"
            >
              Предыдущая
            </button>
            
            <span className="px-3 py-1 text-sm">
              Страница {page}
            </span>
            
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={usersData.users.length < 10}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-accent disabled:opacity-50"
            >
              Следующая
            </button>
          </div>
        </div>
      )}

      {/* Статус мутаций */}
      {(createUserMutation.error || updateUserMutation.error || deleteUserMutation.error) && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="text-destructive font-medium mb-2">Ошибки операций:</div>
          {createUserMutation.error && (
            <div className="text-sm text-destructive">
              Создание: {createUserMutation.error.message}
            </div>
          )}
          {updateUserMutation.error && (
            <div className="text-sm text-destructive">
              Обновление: {updateUserMutation.error.message}
            </div>
          )}
          {deleteUserMutation.error && (
            <div className="text-sm text-destructive">
              Удаление: {deleteUserMutation.error.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}