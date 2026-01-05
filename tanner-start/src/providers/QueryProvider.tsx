import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import type { ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Провайдер для TanStack Query
 * Оборачивает приложение и предоставляет доступ к QueryClient
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools только в режиме разработки */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}

/**
 * HOC для оборачивания компонентов в QueryProvider
 */
export function withQueryProvider<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => (
    <QueryProvider>
      <Component {...props} />
    </QueryProvider>
  )
  
  WrappedComponent.displayName = `withQueryProvider(${Component.displayName || Component.name})`
  
  return WrappedComponent
}