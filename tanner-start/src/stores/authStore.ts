import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthActions = {
  login: (user: AuthUser) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        login: (user: AuthUser) => {
          set(
            {
              user,
              isAuthenticated: true,
              error: null,
            },
            false,
            'auth/login'
          )
        },
        
        logout: () => {
          set(
            {
              user: null,
              isAuthenticated: false,
              error: null,
            },
            false,
            'auth/logout'
          )
        },
        
        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'auth/setLoading')
        },
        
        setError: (error: string | null) => {
          set({ error }, false, 'auth/setError')
        },
        
        clearError: () => {
          set({ error: null }, false, 'auth/clearError')
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)