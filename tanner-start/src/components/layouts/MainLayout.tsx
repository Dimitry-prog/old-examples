import { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

interface MainLayoutProps {
  children: ReactNode
  showFooter?: boolean
}

/**
 * Основной layout для публичных страниц
 * Включает Header и опциональный Footer
 */
export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
