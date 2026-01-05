import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Theme, Language } from '@/types'

type AppState = {
  theme: Theme
  language: Language
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: Date
  }>
}

type AppActions = {
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export type AppStore = AppState & AppActions

const initialState: AppState = {
  theme: 'system',
  language: 'ru',
  sidebarOpen: false,
  notifications: [],
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setTheme: (theme: Theme) => {
        set({ theme }, false, 'app/setTheme')
        
        // Применяем тему к документу
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark')
        } else {
          // system theme
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.classList.toggle('dark', isDark)
        }
      },
      
      setLanguage: (language: Language) => {
        set({ language }, false, 'app/setLanguage')
        document.documentElement.lang = language
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'app/toggleSidebar')
      },
      
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open }, false, 'app/setSidebarOpen')
      },
      
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        
        set(
          (state) => ({
            notifications: [...state.notifications, newNotification],
          }),
          false,
          'app/addNotification'
        )
        
        // Автоматически удаляем уведомление через 5 секунд
        setTimeout(() => {
          get().removeNotification(newNotification.id)
        }, 5000)
      },
      
      removeNotification: (id: string) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'app/removeNotification'
        )
      },
      
      clearNotifications: () => {
        set({ notifications: [] }, false, 'app/clearNotifications')
      },
    }),
    {
      name: 'app-store',
    }
  )
)