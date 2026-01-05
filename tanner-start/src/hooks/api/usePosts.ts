import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys, queryUtils, queryClient } from '@/lib/queryClient'
import { z } from 'zod'

/**
 * Схемы для постов
 */
const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  authorId: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  viewsCount: z.number().default(0),
  likesCount: z.number().default(0),
  commentsCount: z.number().default(0),
})

const postsListSchema = z.object({
  posts: z.array(postSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})

const postResponseSchema = z.object({
  post: postSchema,
})

/**
 * Типы
 */
export type Post = z.infer<typeof postSchema>
export type PostsListResponse = z.infer<typeof postsListSchema>
export type PostResponse = z.infer<typeof postResponseSchema>

export interface PostsFilters extends Record<string, unknown> {
  page?: number
  limit?: number
  search?: string
  authorId?: string
  status?: 'draft' | 'published' | 'archived'
  tags?: string[]
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewsCount' | 'likesCount'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
  status?: 'draft' | 'published'
}

export interface UpdatePostData {
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
}

/**
 * Хук для получения списка постов
 */
export function usePosts(filters: PostsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: async (): Promise<PostsListResponse> => {
      const searchParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, String(item)))
          } else {
            searchParams.append(key, String(value))
          }
        }
      })
      
      const response = await api.get('posts', { searchParams }).json() as unknown
      return postsListSchema.parse(response)
    },
    staleTime: 1000 * 60 * 2, // 2 минуты
  })
}

/**
 * Хук для бесконечной прокрутки постов
 */
export function useInfinitePosts(filters: Omit<PostsFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.posts.list(filters), 'infinite'],
    queryFn: async ({ pageParam = 1 }): Promise<PostsListResponse> => {
      const searchParams = new URLSearchParams()
      
      // Добавляем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, String(item)))
          } else {
            searchParams.append(key, String(value))
          }
        }
      })
      
      // Добавляем номер страницы
      searchParams.append('page', String(pageParam))
      searchParams.append('limit', String(filters.limit || 10))
      
      const response = await api.get('posts', { searchParams }).json()
      return postsListSchema.parse(response)
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Хук для получения конкретного поста
 */
export function usePost(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async (): Promise<Post> => {
      const response = await api.get(`posts/${id}`).json()
      const validated = postResponseSchema.parse(response)
      return validated.post
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}

/**
 * Хук для получения популярных постов
 */
export function usePopularPosts(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.posts.all, 'popular', { limit }],
    queryFn: async (): Promise<Post[]> => {
      const response = await api.get('posts/popular', {
        searchParams: { limit: String(limit) }
      }).json()
      
      const validated = z.object({
        posts: z.array(postSchema)
      }).parse(response)
      
      return validated.posts
    },
    staleTime: 1000 * 60 * 10, // 10 минут (популярные посты меняются редко)
  })
}

/**
 * Хук для получения рекомендованных постов
 */
export function useRecommendedPosts(userId?: string, limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.posts.all, 'recommended', { userId, limit }],
    queryFn: async (): Promise<Post[]> => {
      const searchParams = new URLSearchParams()
      searchParams.append('limit', String(limit))
      if (userId) {
        searchParams.append('userId', userId)
      }
      
      const response = await api.get('posts/recommended', { searchParams }).json()
      
      const validated = z.object({
        posts: z.array(postSchema)
      }).parse(response)
      
      return validated.posts
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 15, // 15 минут
  })
}

/**
 * Хук для создания поста
 */
export function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postData: CreatePostData): Promise<Post> => {
      const response = await api.post('posts', {
        json: postData,
      }).json()
      
      const validated = postResponseSchema.parse(response)
      return validated.post
    },
    onSuccess: (newPost) => {
      // Инвалидируем списки постов
      queryUtils.invalidatePosts()
      
      // Добавляем новый пост в кеш
      queryClient.setQueryData(queryKeys.posts.detail(newPost.id), newPost)
      
      console.log('Пост создан:', newPost.title)
    },
    onError: (error) => {
      console.error('Ошибка создания поста:', error)
    },
  })
}

/**
 * Хук для обновления поста
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePostData }): Promise<Post> => {
      const response = await api.patch(`posts/${id}`, {
        json: data,
      }).json()
      
      const validated = postResponseSchema.parse(response)
      return validated.post
    },
    onSuccess: (updatedPost) => {
      // Обновляем пост в кеше
      queryClient.setQueryData(queryKeys.posts.detail(updatedPost.id), updatedPost)
      
      // Инвалидируем списки постов
      queryUtils.invalidatePosts()
      
      console.log('Пост обновлен:', updatedPost.title)
    },
    onError: (error) => {
      console.error('Ошибка обновления поста:', error)
    },
  })
}

/**
 * Хук для удаления поста
 */
export function useDeletePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`posts/${id}`)
    },
    onSuccess: (_, deletedId) => {
      // Удаляем пост из кеша
      queryClient.removeQueries({
        queryKey: queryKeys.posts.detail(deletedId),
      })
      
      // Инвалидируем списки постов
      queryUtils.invalidatePosts()
      
      console.log('Пост удален')
    },
    onError: (error) => {
      console.error('Ошибка удаления поста:', error)
    },
  })
}

/**
 * Хук для лайка поста
 */
export function useLikePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }): Promise<{ likesCount: number }> => {
      const response = await api.post(`posts/${id}/like`, {
        json: { liked },
      }).json()
      
      return z.object({
        likesCount: z.number()
      }).parse(response)
    },
    onMutate: async ({ id, liked }) => {
      // Отменяем исходящие запросы для этого поста
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(id) })
      
      // Получаем текущие данные
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(id))
      
      // Оптимистично обновляем UI
      if (previousPost) {
        const updatedPost = {
          ...previousPost,
          likesCount: liked ? previousPost.likesCount + 1 : previousPost.likesCount - 1
        }
        queryClient.setQueryData(queryKeys.posts.detail(id), updatedPost)
      }
      
      return { previousPost }
    },
    onError: (error, { id }, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(id), context.previousPost)
      }
      console.error('Ошибка лайка поста:', error)
    },
    onSettled: (_, __, { id }) => {
      // Обновляем данные в любом случае
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) })
    },
  })
}

/**
 * Хук для увеличения счетчика просмотров
 */
export function useIncrementPostViews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ viewsCount: number }> => {
      const response = await api.post(`posts/${id}/view`).json()
      
      return z.object({
        viewsCount: z.number()
      }).parse(response)
    },
    onSuccess: ({ viewsCount }, id) => {
      // Обновляем счетчик просмотров в кеше
      const currentPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(id))
      if (currentPost) {
        queryClient.setQueryData(queryKeys.posts.detail(id), {
          ...currentPost,
          viewsCount
        })
      }
    },
    // Не показываем ошибки для просмотров (не критично)
    onError: () => {},
  })
}

/**
 * Утилиты для работы с постами
 */
export const postQueryUtils = {
  /**
   * Получение поста из кеша
   */
  getCachedPost: (id: string): Post | undefined => {
    return queryClient.getQueryData<Post>(queryKeys.posts.detail(id))
  },
  
  /**
   * Предварительная загрузка поста
   */
  prefetchPost: (id: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.posts.detail(id),
      queryFn: async (): Promise<Post> => {
        const response = await api.get(`posts/${id}`).json()
        const validated = postResponseSchema.parse(response)
        return validated.post
      },
      staleTime: 1000 * 60 * 5,
    })
  },
  
  /**
   * Оптимистичное обновление поста
   */
  optimisticUpdatePost: (id: string, updates: Partial<Post>) => {
    const currentPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(id))
    if (currentPost) {
      queryClient.setQueryData(queryKeys.posts.detail(id), { ...currentPost, ...updates })
    }
  },
}