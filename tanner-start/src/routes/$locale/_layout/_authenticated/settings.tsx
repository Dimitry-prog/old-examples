import { DashboardLayout } from '@/components/layouts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

function SettingsPage() {
  return (
    <DashboardLayout
      title="Настройки"
      subtitle="Управление настройками приложения"
    >
      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Внешний вид</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Тема</p>
                <p className="text-sm text-muted-foreground">
                  Выберите светлую или темную тему
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Светлая
                </Button>
                <Button variant="outline" size="sm">
                  Темная
                </Button>
                <Button variant="default" size="sm">
                  Системная
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Язык интерфейса</p>
                <p className="text-sm text-muted-foreground">
                  Выберите предпочитаемый язык
                </p>
              </div>
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Русский</option>
                <option>English</option>
                <option>Español</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Компактный режим</p>
                <p className="text-sm text-muted-foreground">
                  Уменьшить отступы и размеры элементов
                </p>
              </div>
              <Button variant="outline" size="sm">
                Выключено
              </Button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Уведомления</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email уведомления</p>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления на email
                </p>
              </div>
              <Button variant="default" size="sm">
                Включено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Push уведомления</p>
                <p className="text-sm text-muted-foreground">
                  Получать push уведомления в браузере
                </p>
              </div>
              <Button variant="outline" size="sm">
                Выключено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Еженедельный отчет</p>
                <p className="text-sm text-muted-foreground">
                  Получать еженедельную сводку активности
                </p>
              </div>
              <Button variant="default" size="sm">
                Включено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Уведомления о безопасности</p>
                <p className="text-sm text-muted-foreground">
                  Важные уведомления о безопасности аккаунта
                </p>
              </div>
              <Button variant="default" size="sm" disabled>
                Всегда включено
              </Button>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Приватность</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Профиль виден всем</p>
                <p className="text-sm text-muted-foreground">
                  Разрешить другим пользователям видеть ваш профиль
                </p>
              </div>
              <Button variant="default" size="sm">
                Включено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Показывать статус онлайн</p>
                <p className="text-sm text-muted-foreground">
                  Другие пользователи увидят, когда вы онлайн
                </p>
              </div>
              <Button variant="outline" size="sm">
                Выключено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Аналитика и cookies</p>
                <p className="text-sm text-muted-foreground">
                  Разрешить сбор анонимных данных для улучшения сервиса
                </p>
              </div>
              <Button variant="default" size="sm">
                Включено
              </Button>
            </div>
          </div>
        </Card>

        {/* Advanced Settings */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Дополнительно</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Режим разработчика</p>
                <p className="text-sm text-muted-foreground">
                  Включить дополнительные инструменты для разработчиков
                </p>
              </div>
              <Button variant="outline" size="sm">
                Выключено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Экспериментальные функции</p>
                <p className="text-sm text-muted-foreground">
                  Получить доступ к новым функциям до их официального релиза
                </p>
              </div>
              <Button variant="outline" size="sm">
                Выключено
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Очистить кеш</p>
                <p className="text-sm text-muted-foreground">
                  Удалить временные файлы и кешированные данные
                </p>
              </div>
              <Button variant="outline" size="sm">
                Очистить
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Сбросить</Button>
          <Button>Сохранить изменения</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export const Route = createFileRoute('/$locale/_layout/_authenticated/settings')({
  component: SettingsPage,
})
