import type { User } from '@/lib/schemas'
import type { 
  TestUser, 
  TestAuthState, 
  DeepPartial, 
  TestFactory 
} from './types'

/**
 * Счетчики для уникальных ID
 */
let userIdCounter = 1
let postIdCounter = 1
let commentIdCounter = 1

/**
 * Утилита для создания уникального ID
 */
const createId = (prefix: string, counter: number) => `${prefix}-${counter}`

/**
 * Фабрика для создания тестового пользователя
 */
export const createTestUser: TestFactory<TestUser> = (overrides = {}) => {
  const id = createId('user', userIdCounter++)
  
  return {
    id,
    name: `Test User ${userIdCounter}`,
    email: `user${userIdCounter}@example.com`,
    role: 'user',
    avatar: `https://example.com/avatar-${id}.jpg`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: 'test-password',
    ...overrides,
  }
}

/**
 * Фабрика для создания тестового администратора
 */
export const createTestAdmin: TestFactory<TestUser> = (overrides = {}) => {
  return createTestUser({
    role: 'admin',
    name: `Test Admin ${userIdCounter}`,
    email: `admin${userIdCounter}@example.com`,
    ...overrides,
  })
}

/**
 * Фабрика для создания тестового модератора
 */
export const createTestModerator: TestFactory<TestUser> = (overrides = {}) => {
  return createTestUser({
    role: 'moderator',
    name: `Test Moderator ${userIdCounter}`,
    email: `moderator${userIdCounter}@example.com`,
    ...overrides,
  })
}

/**
 * Фабрика для создания состояния аутентификации
 */
export const createTestAuthState: TestFactory<TestAuthState> = (overrides = {}) => {
  const user = overrides.user !== undefined ? overrides.user : createTestUser()
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    error: null,
    ...overrides,
  }
}

/**
 * Фабрика для создания тестового поста
 */
export const createTestPost: TestFactory<any> = (overrides = {}) => {
  const id = createId('post', postIdCounter++)
  const author = overrides.author || createTestUser()
  
  return {
    id,
    title: `Test Post ${postIdCounter}`,
    content: `This is the content of test post ${postIdCounter}. It contains some sample text for testing purposes.`,
    excerpt: `This is the excerpt of test post ${postIdCounter}`,
    authorId: author.id,
    author,
    tags: ['test', 'example'],
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewsCount: Math.floor(Math.random() * 1000),
    likesCount: Math.floor(Math.random() * 100),
    commentsCount: Math.floor(Math.random() * 50),
    ...overrides,
  }
}

/**
 * Фабрика для создания тестового комментария
 */
export const createTestComment: TestFactory<any> = (overrides = {}) => {
  const id = createId('comment', commentIdCounter++)
  const author = overrides.author || createTestUser()
  const post = overrides.post || createTestPost()
  
  return {
    id,
    content: `This is test comment ${commentIdCounter}`,
    postId: post.id,
    authorId: author.id,
    author,
    parentId: overrides.parentId || undefined,
    replies: [],
    likesCount: Math.floor(Math.random() * 20),
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false,
    ...overrides,
  }
}

/**
 * Фабрика для создания списка пользователей
 */
export const createTestUsersList: TestFactory<{
  users: TestUser[]
  total: number
  page: number
  limit: number
}> = (overrides = {}) => {
  const count = overrides.users?.length || 5
  const users = overrides.users || Array.from({ length: count }, () => createTestUser())
  
  return {
    users,
    total: users.length,
    page: 1,
    limit: 10,
    ...overrides,
  }
}

/**
 * Фабрика для создания списка постов
 */
export const createTestPostsList: TestFactory<{
  posts: any[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> = (overrides = {}) => {
  const count = overrides.posts?.length || 5
  const posts = overrides.posts || Array.from({ length: count }, () => createTestPost())
  
  return {
    posts,
    total: posts.length,
    page: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
    ...overrides,
  }
}

/**
 * Фабрика для создания списка комментариев
 */
export const createTestCommentsList: TestFactory<{
  comments: any[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}> = (overrides = {}) => {
  const count = overrides.comments?.length || 3
  const comments = overrides.comments || Array.from({ length: count }, () => createTestComment())
  
  return {
    comments,
    total: comments.length,
    page: 1,
    limit: 10,
    hasNextPage: false,
    ...overrides,
  }
}

/**
 * Фабрика для создания ошибки API
 */
export const createTestApiError: TestFactory<{
  message: string
  status: number
  code?: string
  details?: Record<string, any>
}> = (overrides = {}) => {
  return {
    message: 'Test API Error',
    status: 500,
    code: 'INTERNAL_ERROR',
    details: {},
    ...overrides,
  }
}

/**
 * Фабрика для создания ошибки валидации
 */
export const createTestValidationError: TestFactory<{
  message: string
  status: number
  errors: Record<string, string[]>
}> = (overrides = {}) => {
  return {
    message: 'Validation Error',
    status: 422,
    errors: {
      email: ['Email is required'],
      password: ['Password must be at least 8 characters'],
    },
    ...overrides,
  }
}

/**
 * Фабрика для создания данных формы
 */
export const createTestFormData: TestFactory<Record<string, any>> = (overrides = {}) => {
  return {
    name: 'Test Name',
    email: 'test@example.com',
    message: 'This is a test message',
    ...overrides,
  }
}

/**
 * Фабрика для создания данных регистрации
 */
export const createTestRegisterData: TestFactory<{
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}> = (overrides = {}) => {
  const password = overrides.password || 'TestPassword123!'
  
  return {
    name: 'Test User',
    email: 'test@example.com',
    password,
    confirmPassword: password,
    acceptTerms: true,
    ...overrides,
  }
}

/**
 * Фабрика для создания данных входа
 */
export const createTestLoginData: TestFactory<{
  email: string
  password: string
  remember?: boolean
}> = (overrides = {}) => {
  return {
    email: 'test@example.com',
    password: 'TestPassword123!',
    remember: false,
    ...overrides,
  }
}

/**
 * Фабрика для создания настроек тестирования
 */
export const createTestConfig: TestFactory<{
  timeout: number
  retries: number
  baseUrl: string
  apiUrl: string
}> = (overrides = {}) => {
  return {
    timeout: 5000,
    retries: 3,
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001/api',
    ...overrides,
  }
}

/**
 * Утилиты для работы с фабриками
 */
export const factoryUtils = {
  /**
   * Создание множественных объектов
   */
  createMany: <T>(factory: TestFactory<T>, count: number, overrides: DeepPartial<T>[] = []) => {
    return Array.from({ length: count }, (_, index) => 
      factory(overrides[index] || {})
    )
  },

  /**
   * Создание объекта с уникальными полями
   */
  createUnique: <T>(factory: TestFactory<T>, uniqueFields: Partial<T>) => {
    return factory(uniqueFields)
  },

  /**
   * Создание связанных объектов
   */
  createRelated: {
    userWithPosts: (userOverrides = {}, postCount = 3) => {
      const user = createTestUser(userOverrides)
      const posts = Array.from({ length: postCount }, () => 
        createTestPost({ author: user, authorId: user.id })
      )
      return { user, posts }
    },

    postWithComments: (postOverrides = {}, commentCount = 5) => {
      const post = createTestPost(postOverrides)
      const comments = Array.from({ length: commentCount }, () =>
        createTestComment({ postId: post.id, post })
      )
      return { post, comments }
    },

    threadedComments: (postOverrides = {}, depth = 2) => {
      const post = createTestPost(postOverrides)
      const rootComment = createTestComment({ postId: post.id, post })
      
      let currentParent = rootComment
      const allComments = [rootComment]
      
      for (let i = 0; i < depth; i++) {
        const reply = createTestComment({
          postId: post.id,
          post,
          parentId: currentParent.id,
        })
        allComments.push(reply)
        currentParent = reply
      }
      
      return { post, comments: allComments }
    },
  },

  /**
   * Сброс счетчиков
   */
  resetCounters: () => {
    userIdCounter = 1
    postIdCounter = 1
    commentIdCounter = 1
  },
}

/**
 * Предустановленные наборы данных
 */
export const testDataSets = {
  // Базовый набор пользователей
  basicUsers: () => [
    createTestUser({ role: 'admin', name: 'Admin User', email: 'admin@example.com' }),
    createTestUser({ role: 'moderator', name: 'Moderator User', email: 'moderator@example.com' }),
    createTestUser({ role: 'user', name: 'Regular User', email: 'user@example.com' }),
  ],

  // Набор постов с разными статусами
  postsWithStatuses: () => [
    createTestPost({ status: 'published', title: 'Published Post' }),
    createTestPost({ status: 'draft', title: 'Draft Post' }),
    createTestPost({ status: 'archived', title: 'Archived Post' }),
  ],

  // Набор комментариев с вложенностью
  nestedComments: () => {
    const post = createTestPost()
    const parent = createTestComment({ postId: post.id })
    const child1 = createTestComment({ postId: post.id, parentId: parent.id })
    const child2 = createTestComment({ postId: post.id, parentId: parent.id })
    const grandchild = createTestComment({ postId: post.id, parentId: child1.id })
    
    return { post, comments: [parent, child1, child2, grandchild] }
  },
}