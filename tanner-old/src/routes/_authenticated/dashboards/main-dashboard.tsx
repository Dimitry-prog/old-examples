import { createFileRoute } from '@tanstack/react-router';
import { createRouteGuard } from '@/shared/lib/guards/route-guard';

export const Route = createFileRoute('/_authenticated/dashboards/main-dashboard')({
  beforeLoad: createRouteGuard('/_authenticated/dashboards/main-dashboard'),
  component: MainDashboardComponent,
});

function MainDashboardComponent() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Главный дашборд</h2>
        <p className="mb-4 text-gray-600">
          Этот дашборд требует разрешение: <code className="rounded bg-gray-100 px-2 py-1">dashboards:main:read</code>
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-blue-50 p-4">
            <h3 className="mb-2 text-lg font-medium text-blue-900">Пользователи</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>

          <div className="rounded-lg border bg-green-50 p-4">
            <h3 className="mb-2 text-lg font-medium text-green-900">Активные сессии</h3>
            <p className="text-3xl font-bold text-green-600">567</p>
          </div>

          <div className="rounded-lg border bg-purple-50 p-4">
            <h3 className="mb-2 text-lg font-medium text-purple-900">Транзакции</h3>
            <p className="text-3xl font-bold text-purple-600">8,901</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-xl font-semibold">Последние события</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-700">Новый пользователь зарегистрирован</span>
            <span className="text-sm text-gray-500">5 минут назад</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-700">Обновление системы завершено</span>
            <span className="text-sm text-gray-500">1 час назад</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-700">Резервное копирование выполнено</span>
            <span className="text-sm text-gray-500">3 часа назад</span>
          </div>
        </div>
      </div>
    </div>
  );
}
