import { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/api/useUsers'
import { usePosts, useInfinitePosts, useCreatePost, useLikePost } from '@/hooks/api/usePosts'
import { useComments, useCreateComment, useLikeComment } from '@/hooks/api/useComments'
import { QueryProvider } from '@/providers/QueryProvider'

/**
 * Демо компонент для пользователей
 */
function UsersDemo() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  
  // Получение списка пользователей с фильтрами
  const { 
    data: usersData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useUsers({
    search: searchTerm || undefined,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    limit: 10,
  })
  
  // Мутации
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  
  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        name: 'Новый пользователь',
        email: `user${Date.now()}@example.com`,
        role: 'user',
      })
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
    }
  }
  
  const handleUpdateUser = async (id: string) => {
    try {
      await updateUserMutation.mutateAsync({
        id,
        data: {
          name: `Обновленный пользователь ${Date.now()}`,
        },
      })
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
    }
  }
  
  const handleDeleteUser = async (id: string) => {
    if (confirm('Удалить пользователя?')) {
      try {
        await deleteUserMutation.mutateAsync(id)
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error)
      }
    }
  }
  
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Управление пользователями</h3>
      
      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Поиск пользователей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        />
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">Все роли</option>
          <option value="admin">Администратор</option>
          <option value="moderator">Модератор</option>
          <option value="user">Пользователь</option>
        </select>
        
        <button
          onClick={handleCreateUser}
          disabled={createUserMutation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {createUserMutation.isPending ? 'Создание...' : 'Создать пользователя'}
        </button>
      </div>
      
      {/* Состояния загрузки и ошибок */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Загрузка пользователей...</span>
        </div>
      )}
      
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
          <p className="text-destructive">
            Ошибка загрузки: {error?.message || 'Неизвестная ошибка'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
          >
            Повторить
          </button>
        </div>
      )}
      
      {/* Список пользователей */}
      {usersData && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Найдено: {usersData.total} пользователей
            </p>
          </div>
          
          <div className="space-y-2">
            {usersData.users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-muted rounded mt-1">
                    {user.role}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateUser(user.id)}
                    disabled={updateUserMutation.isPending}
                    className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteUserMutation.isPending}
                    className="px-3 py-1 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Демо компонент для постов с бесконечной прокруткой
 */
function PostsDemo() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  
  // Бесконечная прокрутка постов
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfinitePosts({
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    limit: 5,
  })
  
  // Мутации
  const createPostMutation = useCreatePost()
  const likePostMutation = useLikePost()
  
  const handleCreatePost = async () => {
    try {
      await createPostMutation.mutateAsync({
        title: `Новый пост ${Date.now()}`,
        content: 'Содержимое нового поста...',
        status: 'published',
        tags: ['demo', 'test'],
      })
    } catch (error) {
      console.error('Ошибка создания поста:', error)
    }
  }
  
  const handleLikePost = async (id: string, currentlyLiked: boolean) => {
    try {
      await likePostMutation.mutateAsync({
        id,
        liked: !currentlyLiked,
      })
    } catch (error) {
      console.error('Ошибка лайка поста:', error)
    }
  }
  
  // Все посты из всех страниц
  const allPosts = data?.pages.flatMap(page => page.posts) ?? []
  
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Посты с бесконечной прокруткой</h3>
      
      {/* Фильтры и действия */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">Все статусы</option>
          <option value="published">Опубликованные</option>
          <option value="draft">Черновики</option>
          <option value="archived">Архивные</option>
        </select>
        
        <button
          onClick={handleCreatePost}
          disabled={createPostMutation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {createPostMutation.isPending ? 'Создание...' : 'Создать пост'}
        </button>
      </div>
      
      {/* Состояния загрузки и ошибок */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Загрузка постов...</span>
        </div>
      )}
      
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
          <p className="text-destructive">
            Ошибка загрузки: {error?.message || 'Неизвестная ошибка'}
          </p>
        </div>
      )}
      
      {/* Список постов */}
      {allPosts.length > 0 && (
        <div className="space-y-4">
          {allPosts.map((post) => (
            <div key={post.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{post.title}</h4>
                <span className={`px-2 py-1 text-xs rounded ${
                  post.status === 'published' ? 'bg-green-100 text-green-800' :
                  post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {post.excerpt || post.content.substring(0, 150) + '...'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>👁 {post.viewsCount}</span>
                  <span>💬 {post.commentsCount}</span>
                  <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                
                <button
                  onClick={() => handleLikePost(post.id, false)} // Упрощено для демо
                  disabled={likePostMutation.isPending}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded"
                >
                  <span>❤️</span>
                  <span>{post.likesCount}</span>
                </button>
              </div>
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Кнопка загрузки следующей страницы */}
          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Демо компонент для комментариев
 */
function CommentsDemo() {
  const [selectedPostId, setSelectedPostId] = useState('post-1')
  const [newCommentText, setNewCommentText] = useState('')
  
  // Получение комментариев
  const { data: commentsData, isLoading } = useComments(selectedPostId)
  
  // Мутации
  const createCommentMutation = useCreateComment()
  const likeCommentMutation = useLikeComment()
  
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    
    try {
      await createCommentMutation.mutateAsync({
        content: newCommentText,
        postId: selectedPostId,
      })
      setNewCommentText('')
    } catch (error) {
      console.error('Ошибка создания комментария:', error)
    }
  }
  
  const handleLikeComment = async (id: string, currentlyLiked: boolean) => {
    try {
      await likeCommentMutation.mutateAsync({
        id,
        liked: !currentlyLiked,
      })
    } catch (error) {
      console.error('Ошибка лайка комментария:', error)
    }
  }
  
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Комментарии</h3>
      
      {/* Выбор поста */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Выберите пост:</label>
        <select
          value={selectedPostId}
          onChange={(e) => setSelectedPostId(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="post-1">Пост 1</option>
          <option value="post-2">Пост 2</option>
          <option value="post-3">Пост 3</option>
        </select>
      </div>
      
      {/* Форма создания комментария */}
      <form onSubmit={handleCreateComment} className="mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Новый комментарий:</label>
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Напишите комментарий..."
            rows={3}
            className="w-full px-3 py-2 border rounded-md bg-background resize-none"
          />
          <button
            type="submit"
            disabled={createCommentMutation.isPending || !newCommentText.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {createCommentMutation.isPending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
      
      {/* Список комментариев */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Загрузка комментариев...</span>
        </div>
      )}
      
      {commentsData && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Комментариев: {commentsData.total}
          </p>
          
          {commentsData.comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm">
                    {comment.author?.name || 'Аноним'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.isEdited && ' (изменено)'}
                  </p>
                </div>
              </div>
              
              <p className="text-sm mb-3">{comment.content}</p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(comment.id, comment.isLiked)}
                  disabled={likeCommentMutation.isPending}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${
                    comment.isLiked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span>{comment.isLiked ? '❤️' : '🤍'}</span>
                  <span>{comment.likesCount}</span>
                </button>
                
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  Ответить
                </button>
              </div>
              
              {/* Вложенные комментарии */}
              {comment.replies.length > 0 && (
                <div className="ml-4 mt-3 space-y-2 border-l-2 border-muted pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-sm">
                      <p className="font-medium">{reply.author?.name || 'Аноним'}</p>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Главный компонент демонстрации TanStack Query
 */
export function TanStackQueryDemo() {
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments'>('users')
  
  const tabs = [
    { id: 'users', label: 'Пользователи' },
    { id: 'posts', label: 'Посты' },
    { id: 'comments', label: 'Комментарии' },
  ] as const
  
  return (
    <QueryProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">TanStack Query Demo</h2>
          <p className="text-muted-foreground mb-6">
            Демонстрация возможностей TanStack Query для управления серверным состоянием
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'users' && <UsersDemo />}
          {activeTab === 'posts' && <PostsDemo />}
          {activeTab === 'comments' && <CommentsDemo />}
        </div>
        
        {/* Features info */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-semibold mb-3">Возможности TanStack Query</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ Реализовано:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Кеширование данных</li>
                <li>• Автоматическое обновление</li>
                <li>• Оптимистичные обновления</li>
                <li>• Бесконечная прокрутка</li>
                <li>• Повторные запросы при ошибках</li>
                <li>• Фоновое обновление</li>
                <li>• Инвалидация кеша</li>
                <li>• DevTools для отладки</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Конфигурация:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Централизованные ключи запросов</li>
                <li>• Оптимальные настройки кеширования</li>
                <li>• Обработка ошибок</li>
                <li>• Типобезопасность</li>
                <li>• Утилиты для работы с кешем</li>
                <li>• Разные настройки для dev/prod</li>
                <li>• Интеграция с API клиентом</li>
                <li>• Валидация данных с Zod</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </QueryProvider>
  )
}