import { createFileRoute } from '@tanstack/react-router';
import { createRouteGuard } from '@/shared/lib/guards/route-guard';

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: createRouteGuard('/_authenticated/users'),
  component: UsersComponent,
});

function UsersComponent() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-lg border bg-white p-6 shadow">
          <h1 className="mb-4 text-3xl font-bold">Управление пользователями</h1>
          <p className="mb-4 text-gray-600">
            Эта страница требует разрешение: <code className="rounded bg-gray-100 px-2 py-1">users:read</code>
          </p>

          <div className="mb-4 flex items-center justify-between">
            <input
              type="text"
              placeholder="Поиск пользователей..."
              className="w-64 rounded border px-4 py-2"
            />
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              + Добавить пользователя
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Имя</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Роль</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Статус</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">1</td>
                  <td className="px-4 py-3 text-sm font-medium">Иван Иванов</td>
                  <td className="px-4 py-3 text-sm">ivan@example.com</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      Администратор
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Активен
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="mr-2 text-blue-600 hover:text-blue-800">Редактировать</button>
                    <button className="text-red-600 hover:text-red-800">Удалить</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">2</td>
                  <td className="px-4 py-3 text-sm font-medium">Мария Петрова</td>
                  <td className="px-4 py-3 text-sm">maria@example.com</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Менеджер
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Активен
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="mr-2 text-blue-600 hover:text-blue-800">Редактировать</button>
                    <button className="text-red-600 hover:text-red-800">Удалить</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">3</td>
                  <td className="px-4 py-3 text-sm font-medium">Алексей Сидоров</td>
                  <td className="px-4 py-3 text-sm">alexey@example.com</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                      Пользователь
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      Неактивен
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="mr-2 text-blue-600 hover:text-blue-800">Редактировать</button>
                    <button className="text-red-600 hover:text-red-800">Удалить</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
