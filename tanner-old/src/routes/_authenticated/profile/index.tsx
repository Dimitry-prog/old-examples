import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfileComponent,
});

function ProfileComponent() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Профиль пользователя</h1>
        <Link to="/profile/payment-methods">
          <button className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Редактировать профиль
          </button>
        </Link>
        {/* Информация о пользователе
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя пользователя
              </label>
              <div className="text-gray-900">{auth.user?.username}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="text-gray-900">{auth.user?.email}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Активен
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Редактировать профиль
            </button>
          </div>
        </div>

        {/* Навигация по подстраницам профиля */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            to="/profile/shipping-address"
            className="rounded-lg border bg-white p-6 shadow transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Адреса доставки</h3>
                <p className="text-sm text-gray-600">Управление адресами для доставки</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/payment-methods"
            className="rounded-lg border bg-white p-6 shadow transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Способы оплаты</h3>
                <p className="text-sm text-gray-600">Управление банковскими картами</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
