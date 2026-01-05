import { useAppStore } from '@/stores/appStore'
import { useEffect } from 'react'

export function useApp() {
  const {
    theme,
    language,
    sidebarOpen,
    notifications,
    setTheme,
    setLanguage,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useAppStore()

  // Инициализация темы при загрузке
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
      
      // Слушаем изменения системной темы
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Функция для показа уведомления
  const showNotification = (
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    addNotification({ type, title, message })
  }

  return {
    theme,
    language,
    sidebarOpen,
    notifications,
    setTheme,
    setLanguage,
    toggleSidebar,
    setSidebarOpen,
    showNotification,
    removeNotification,
    clearNotifications,
  }
}