import { createFileRoute } from '@tanstack/react-router'
import { RoleBasedRender } from '@/components/guards/RouteGuard'
import { UsersExample } from '@/components/examples/UsersExample'

function AdminPage() {
  return (
    <RoleBasedRender requiredRole="moderator">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
            <p className="text-muted-foreground">
              Управление системой и пользователями
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card text-card-foreground rounded-lg border p-6">
                <h3 className="font-semibold mb-4">🛠️ Системные настройки</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md">
                    Конфигурация
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md">
                    Логи системы
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md">
                    Мониторинг
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md">
                    Резервные копии
                  </button>
                </div>
              </div>
              
              <div className="bg-card text-card-foreground rounded-lg border p-6">
                <h3 className="font-semibold mb-4">📊 Статистика</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Всего пользователей</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Активных сессий</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Использование памяти</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Загрузка CPU</span>
                    <span className="font-medium">23%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-card text-card-foreground rounded-lg border p-6">
                <h3 className="font-semibold mb-4">👥 Управление пользователями</h3>
                <UsersExample />
              </div>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground rounded-lg border p-6">
            <h3 className="font-semibold mb-4">🔒 Безопасность</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-muted-foreground">Успешных входов</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-muted-foreground">Подозрительных попыток</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-muted-foreground">Заблокированных IP</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-muted-foreground">Мониторинг</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRender>
  )
}

export const Route = createFileRoute('/$locale/_layout/_authenticated/admin')({
  component: AdminPage,
})