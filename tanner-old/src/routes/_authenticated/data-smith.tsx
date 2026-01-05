import { createFileRoute } from '@tanstack/react-router';
import { createRouteGuard } from '@/shared/lib/guards/route-guard';

export const Route = createFileRoute('/_authenticated/data-smith')({
  beforeLoad: createRouteGuard('/_authenticated/data-smith', true), // requireAll = true
  component: DataSmithComponent,
});

function DataSmithComponent() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-lg border bg-white p-6 shadow">
          <h1 className="mb-4 text-3xl font-bold">Data Smith</h1>
          <p className="mb-4 text-gray-600">
            Эта страница требует ВСЕ разрешения:{' '}
            <code className="rounded bg-gray-100 px-2 py-1">data:read</code> и{' '}
            <code className="rounded bg-gray-100 px-2 py-1">data:write</code>
          </p>

          <div className="space-y-6">
            <div className="rounded-lg border bg-blue-50 p-4">
              <h2 className="mb-3 text-xl font-semibold text-blue-900">Управление данными</h2>
              <p className="mb-4 text-blue-800">
                Здесь вы можете просматривать и редактировать данные системы.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded bg-white p-3">
                  <div>
                    <h3 className="font-medium">База данных пользователей</h3>
                    <p className="text-sm text-gray-600">1,234 записей</p>
                  </div>
                  <div className="space-x-2">
                    <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                      Просмотр
                    </button>
                    <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                      Редактировать
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded bg-white p-3">
                  <div>
                    <h3 className="font-medium">Транзакции</h3>
                    <p className="text-sm text-gray-600">8,901 записей</p>
                  </div>
                  <div className="space-x-2">
                    <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                      Просмотр
                    </button>
                    <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                      Редактировать
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded bg-white p-3">
                  <div>
                    <h3 className="font-medium">Логи системы</h3>
                    <p className="text-sm text-gray-600">45,678 записей</p>
                  </div>
                  <div className="space-x-2">
                    <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                      Просмотр
                    </button>
                    <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                      Редактировать
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-amber-50 p-4">
              <h2 className="mb-3 text-xl font-semibold text-amber-900">Инструменты</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button className="rounded bg-white p-4 text-left shadow transition-shadow hover:shadow-md">
                  <h3 className="mb-1 font-medium">Импорт данных</h3>
                  <p className="text-sm text-gray-600">Загрузить данные из файла</p>
                </button>
                <button className="rounded bg-white p-4 text-left shadow transition-shadow hover:shadow-md">
                  <h3 className="mb-1 font-medium">Экспорт данных</h3>
                  <p className="text-sm text-gray-600">Выгрузить данные в файл</p>
                </button>
                <button className="rounded bg-white p-4 text-left shadow transition-shadow hover:shadow-md">
                  <h3 className="mb-1 font-medium">Анализ данных</h3>
                  <p className="text-sm text-gray-600">Запустить анализ</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
