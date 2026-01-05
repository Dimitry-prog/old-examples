import { DashboardLayout } from '@/components/layouts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/contexts/AuthContext'
import { createFileRoute } from '@tanstack/react-router'

function ProfilePage() {
  const { user } = useAuthContext()

  return (
    <DashboardLayout
      title="Профиль"
      subtitle="Управление вашим профилем и настройками"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-xl font-semibold">{user?.name || 'Пользователь'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || 'email@example.com'}</p>
            <div className="mt-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {user?.role || 'user'}
            </div>
            <Button variant="outline" size="sm" className="mt-6 w-full">
              Изменить фото
            </Button>
          </div>
        </Card>

        {/* Profile Information */}
        <Card className="p-6 md:col-span-2">
          <h3 className="mb-6 text-lg font-semibold">Личная информация</h3>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                  Имя
                </label>
                <Input
                  id="firstName"
                  type="text"
                  defaultValue={user?.name?.split(' ')[0] || ''}
                  placeholder="Введите имя"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                  Фамилия
                </label>
                <Input
                  id="lastName"
                  type="text"
                  defaultValue={user?.name?.split(' ')[1] || ''}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Телефон
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 999-99-99"
              />
            </div>

            <div>
              <label htmlFor="bio" className="mb-2 block text-sm font-medium">
                О себе
              </label>
              <textarea
                id="bio"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Расскажите о себе..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button">
                Отмена
              </Button>
              <Button type="submit">Сохранить изменения</Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Account Settings */}
      <Card className="mt-6 p-6">
        <h3 className="mb-6 text-lg font-semibold">Настройки аккаунта</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Двухфакторная аутентификация</p>
              <p className="text-sm text-muted-foreground">
                Дополнительная защита вашего аккаунта
              </p>
            </div>
            <Button variant="outline" size="sm">
              Включить
            </Button>
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Уведомления по email</p>
              <p className="text-sm text-muted-foreground">
                Получать уведомления о важных событиях
              </p>
            </div>
            <Button variant="outline" size="sm">
              Настроить
            </Button>
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Сменить пароль</p>
              <p className="text-sm text-muted-foreground">
                Обновите пароль для повышения безопасности
              </p>
            </div>
            <Button variant="outline" size="sm">
              Изменить
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600">Удалить аккаунт</p>
              <p className="text-sm text-muted-foreground">
                Безвозвратное удаление вашего аккаунта и всех данных
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Удалить
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  )
}

export const Route = createFileRoute('/$locale/_layout/_authenticated/profile')({
  component: ProfilePage,
})
