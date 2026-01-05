import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/profile/payment-methods')({
  component: PaymentMethodsComponent,
});

function PaymentMethodsComponent() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/profile" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          ← Назад к профилю
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Способы оплаты</h1>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <h3 className="font-medium">•••• •••• •••• 1234</h3>
                  <p className="text-gray-600 text-sm">Истекает 12/25</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Редактировать</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  MC
                </div>
                <div>
                  <h3 className="font-medium">•••• •••• •••• 5678</h3>
                  <p className="text-gray-600 text-sm">Истекает 08/26</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Редактировать</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
              </div>
            </div>
          </div>
        </div>

        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          + Добавить новую карту
        </button>
      </div>
    </div>
  );
}
