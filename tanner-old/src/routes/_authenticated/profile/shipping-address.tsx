import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/profile/shipping-address')({
  component: ShippingAddressComponent,
});

function ShippingAddressComponent() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/profile" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          ← Назад к профилю
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Адреса доставки</h1>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Домашний адрес</h3>
                <p className="text-gray-600 mt-1">
                  ул. Примерная, д. 123, кв. 45
                  <br />
                  г. Москва, 123456
                  <br />
                  Россия
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Редактировать</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Рабочий адрес</h3>
                <p className="text-gray-600 mt-1">
                  ул. Офисная, д. 456, офис 789
                  <br />
                  г. Москва, 654321
                  <br />
                  Россия
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Редактировать</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
              </div>
            </div>
          </div>
        </div>

        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          + Добавить новый адрес
        </button>
      </div>
    </div>
  );
}
