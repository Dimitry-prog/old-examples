// Типы для компонентов

import type { ReactNode } from 'react'

export type BaseComponentProps = {
  children?: ReactNode
  className?: string
}

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
