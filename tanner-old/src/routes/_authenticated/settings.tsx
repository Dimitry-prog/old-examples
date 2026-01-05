import { createFileRoute } from '@tanstack/react-router';
import { createRouteGuard } from '@/shared/lib/guards/route-guard';
import { PermissionGuard } from '@/shared/components/permission-guard/permission-guard';

export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: createRouteGuard('/_authenticated/settings'),
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Настройки</h1>

        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Общие настройки</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Уведомления</h3>
                  <p className="text-sm text-gray-600">Получать уведомления о важных событиях</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Темная тема</h3>
                  <p className="text-sm text-gray-600">Использовать темную тему интерфейса</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Безопасность</h2>

            <div className="space-y-4">
              <button className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Изменить пароль
              </button>

              <button className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                Настроить двухфакторную аутентификацию
              </button>
            </div>
          </div>

          {/* Пример использования PermissionGuard для условного отображения */}
          <PermissionGuard
            permissions={['admin:access', 'settings:advanced']}
            fallback={
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ Расширенные настройки доступны только администраторам
                </p>
              </div>
            }
          >
            <div className="rounded-lg border bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Расширенные настройки</h2>
              <p className="mb-4 text-sm text-gray-600">
                Эти настройки доступны только пользователям с разрешениями{' '}
                <code className="rounded bg-gray-100 px-1">admin:access</code> или{' '}
                <code className="rounded bg-gray-100 px-1">settings:advanced</code>
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Режим отладки</h3>
                    <p className="text-sm text-gray-600">Включить расширенное логирование</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">API ключи</h3>
                    <p className="text-sm text-gray-600">Управление API ключами</p>
                  </div>
                  <button className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700">
                    Управление
                  </button>
                </div>

                <PermissionGuard
                  permissions={['admin:access']}
                  requireAll
                  fallback={
                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm text-gray-600">
                        🔒 Системные настройки доступны только администраторам
                      </p>
                    </div>
                  }
                >
                  <div className="rounded border border-red-200 bg-red-50 p-3">
                    <h4 className="mb-2 font-medium text-red-900">Системные настройки</h4>
                    <button className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
                      Очистить кэш
                    </button>
                  </div>
                </PermissionGuard>
              </div>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}

