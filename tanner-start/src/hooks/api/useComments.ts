import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys, queryUtils } from '@/lib/queryClient'
import { z } from 'zod'

/**
 * Схемы для комментариев
 */
const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  postId: z.string(),
  authorId: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().optional(),
  }).optional(),
  parentId: z.string().optional(), // Для вложенных комментариев
  replies: z.array(z.lazy(() => commentSchema)).default([]), // Рекурсивная структура
  likesCount: z.number().default(0),
  isLiked: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  isEdited: z.boolean().default(false),
})

const commentsListSchema = z.object({
  comments: z.array(commentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
})

const commentResponseSchema = z.object({
  comment: commentSchema,
})

/**
 * Типы
 */
export type Comment = z.infer<typeof commentSchema>
export type CommentsListResponse = z.infer<typeof commentsListSchema>
export type CommentResponse = z.infer<typeof commentResponseSchema>

export interface CommentsFilters {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'likesCount'
  sortOrder?: 'asc' | 'desc'
  includeReplies?: boolean
}

export interface CreateCommentData {
  content: string
  postId: string
  parentId?: string // Для ответов на комментарии
}

export interface UpdateCommentData {
  content: string
}

/**
 * Хук для получения комментариев поста
 */
export function useComments(postId: string, filters: CommentsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.comments.list(postId),
    queryFn: async (): Promise<CommentsListResponse> => {
      const searchParams = new URLSearchParams()
      
      // Добавляем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      
      const response = await api.get(`posts/${postId}/comments`, {
        searchParams,
      }).json()
      
      return commentsListSchema.parse(response)
    },
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 минута (комментарии обновляются часто)
  })
}

/**
 * Хук для получения конкретного комментария
 */
export function useComment(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.comments.detail(id),
    queryFn: async (): Promise<Comment> => {
      const response = await api.get(`comments/${id}`).json()
      const validated = commentResponseSchema.parse(response)
      return validated.comment
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 минуты
  })
}

/**
 * Хук для получения ответов на комментарий
 */
export function useCommentReplies(commentId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.comments.detail(commentId), 'replies'],
    queryFn: async (): Promise<Comment[]> => {
      const response = await api.get(`comments/${commentId}/replies`).json()
      
      const validated = z.object({
        replies: z.array(commentSchema)
      }).parse(response)
      
      return validated.replies
    },
    enabled: enabled && !!commentId,
    staleTime: 1000 * 60, // 1 минута
  })
}

/**
 * Хук для создания комментария
 */
export function useCreateComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (commentData: CreateCommentData): Promise<Comment> => {
      const response = await api.post('comments', {
        json: commentData,
      }).json()
      
      const validated = commentResponseSchema.parse(response)
      return validated.comment
    },
    onSuccess: (newComment) => {
      // Инвалидируем комментарии поста
      queryUtils.invalidatePostComments(newComment.postId)
      
      // Добавляем комментарий в кеш
      queryClient.setQueryData(queryKeys.comments.detail(newComment.id), newComment)
      
      // Если это ответ на комментарий, инвалидируем ответы родительского комментария
      if (newComment.parentId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.comments.detail(newComment.parentId), 'replies'],
        })
      }
      
      console.log('Комментарий создан')
    },
    onError: (error) => {
      console.error('Ошибка создания комментария:', error)
    },
  })
}

/**
 * Хук для обновления комментария
 */
export function useUpdateComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCommentData }): Promise<Comment> => {
      const response = await api.patch(`comments/${id}`, {
        json: data,
      }).json()
      
      const validated = commentResponseSchema.parse(response)
      return validated.comment
    },
    onSuccess: (updatedComment) => {
      // Обновляем комментарий в кеше
      queryClient.setQueryData(queryKeys.comments.detail(updatedComment.id), updatedComment)
      
      // Инвалидируем комментарии поста
      queryUtils.invalidatePostComments(updatedComment.postId)
      
      console.log('Комментарий обновлен')
    },
    onError: (error) => {
      console.error('Ошибка обновления комментария:', error)
    },
  })
}

/**
 * Хук для удаления комментария
 */
export function useDeleteComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ postId: string; parentId?: string }> => {
      const response = await api.delete(`comments/${id}`).json()
      
      return z.object({
        postId: z.string(),
        parentId: z.string().optional(),
      }).parse(response)
    },
    onSuccess: ({ postId, parentId }, deletedId) => {
      // Удаляем комментарий из кеша
      queryClient.removeQueries({
        queryKey: queryKeys.comments.detail(deletedId),
      })
      
      // Инвалидируем комментарии поста
      queryUtils.invalidatePostComments(postId)
      
      // Если это был ответ, инвалидируем ответы родительского комментария
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.comments.detail(parentId), 'replies'],
        })
      }
      
      console.log('Комментарий удален')
    },
    onError: (error) => {
      console.error('Ошибка удаления комментария:', error)
    },
  })
}

/**
 * Хук для лайка комментария
 */
export function useLikeComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }): Promise<{ likesCount: number; isLiked: boolean }> => {
      const response = await api.post(`comments/${id}/like`, {
        json: { liked },
      }).json()
      
      return z.object({
        likesCount: z.number(),
        isLiked: z.boolean(),
      }).parse(response)
    },
    onMutate: async ({ id, liked }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.detail(id) })
      
      // Получаем текущие данные
      const previousComment = queryClient.getQueryData<Comment>(queryKeys.comments.detail(id))
      
      // Оптимистично обновляем UI
      if (previousComment) {
        const updatedComment = {
          ...previousComment,
          likesCount: liked ? previousComment.likesCount + 1 : previousComment.likesCount - 1,
          isLiked: liked,
        }
        queryClient.setQueryData(queryKeys.comments.detail(id), updatedComment)
      }
      
      return { previousComment }
    },
    onError: (error, { id }, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousComment) {
        queryClient.setQueryData(queryKeys.comments.detail(id), context.previousComment)
      }
      console.error('Ошибка лайка комментария:', error)
    },
    onSettled: (_, __, { id }) => {
      // Обновляем данные в любом случае
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.detail(id) })
    },
  })
}

/**
 * Хук для получения количества комментариев поста
 */
export function useCommentsCount(postId: string) {
  return useQuery({
    queryKey: [...queryKeys.comments.all, 'count', postId],
    queryFn: async (): Promise<number> => {
      const response = await api.get(`posts/${postId}/comments/count`).json()
      
      const validated = z.object({
        count: z.number()
      }).parse(response)
      
      return validated.count
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 2, // 2 минуты
  })
}

/**
 * Хук для получения последних комментариев пользователя
 */
export function useUserComments(userId: string, limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.comments.all, 'user', userId, { limit }],
    queryFn: async (): Promise<Comment[]> => {
      const response = await api.get(`users/${userId}/comments`, {
        searchParams: { limit: String(limit) }
      }).json()
      
      const validated = z.object({
        comments: z.array(commentSchema)
      }).parse(response)
      
      return validated.comments
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}

/**
 * Утилиты для работы с комментариями
 */
export const commentQueryUtils = {
  /**
   * Получение комментария из кеша
   */
  getCachedComment: (id: string): Comment | undefined => {
    return queryClient.getQueryData<Comment>(queryKeys.comments.detail(id))
  },
  
  /**
   * Оптимистичное добавление комментария в список
   */
  optimisticAddComment: (postId: string, comment: Comment) => {
    const commentsKey = queryKeys.comments.list(postId)
    const currentComments = queryClient.getQueryData<CommentsListResponse>(commentsKey)
    
    if (currentComments) {
      const updatedComments = {
        ...currentComments,
        comments: [comment, ...currentComments.comments],
        total: currentComments.total + 1,
      }
      queryClient.setQueryData(commentsKey, updatedComments)
    }
  },
  
  /**
   * Оптимистичное удаление комментария из списка
   */
  optimisticRemoveComment: (postId: string, commentId: string) => {
    const commentsKey = queryKeys.comments.list(postId)
    const currentComments = queryClient.getQueryData<CommentsListResponse>(commentsKey)
    
    if (currentComments) {
      const updatedComments = {
        ...currentComments,
        comments: currentComments.comments.filter(comment => comment.id !== commentId),
        total: currentComments.total - 1,
      }
      queryClient.setQueryData(commentsKey, updatedComments)
    }
  },
  
  /**
   * Построение дерева комментариев
   */
  buildCommentsTree: (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>()
    const rootComments: Comment[] = []
    
    // Создаем карту комментариев
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })
    
    // Строим дерево
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })
    
    return rootComments
  },
}