// Типы для API

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type RequestConfig = {
  method?: HttpMethod
  headers?: Record<string, string>
  timeout?: number
  retry?: number
}

export type PaginationParams = {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
