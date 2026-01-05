import { createFileRoute } from '@tanstack/react-router';
import { createRouteGuard } from '@/shared/lib/guards/route-guard';

export const Route = createFileRoute('/_authenticated/dashboards/trading-dashboard')({
  beforeLoad: createRouteGuard('/_authenticated/dashboards/trading-dashboard'),
  component: TradingDashboardComponent,
});

function TradingDashboardComponent() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Торговый дашборд</h2>
        <p className="mb-4 text-gray-600">
          Этот дашборд требует разрешение: <code className="rounded bg-gray-100 px-2 py-1">dashboards:trading:read</code>
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-emerald-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-emerald-900">Общий объем</h3>
            <p className="text-2xl font-bold text-emerald-600">$1.2M</p>
            <p className="text-xs text-emerald-700">+12.5% за день</p>
          </div>

          <div className="rounded-lg border bg-amber-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-amber-900">Открытые позиции</h3>
            <p className="text-2xl font-bold text-amber-600">45</p>
            <p className="text-xs text-amber-700">3 новых</p>
          </div>

          <div className="rounded-lg border bg-rose-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-rose-900">Прибыль/Убыток</h3>
            <p className="text-2xl font-bold text-rose-600">+$45.2K</p>
            <p className="text-xs text-rose-700">+8.3% за неделю</p>
          </div>

          <div className="rounded-lg border bg-sky-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-sky-900">Активные трейдеры</h3>
            <p className="text-2xl font-bold text-sky-600">234</p>
            <p className="text-xs text-sky-700">+15 за час</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold">Топ активов</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">BTC/USD</span>
                <span className="ml-2 text-sm text-gray-500">Bitcoin</span>
              </div>
              <span className="font-semibold text-green-600">+5.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">ETH/USD</span>
                <span className="ml-2 text-sm text-gray-500">Ethereum</span>
              </div>
              <span className="font-semibold text-green-600">+3.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">AAPL</span>
                <span className="ml-2 text-sm text-gray-500">Apple Inc.</span>
              </div>
              <span className="font-semibold text-red-600">-1.2%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold">Последние сделки</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2 text-sm">
              <span className="text-gray-700">BTC/USD - Покупка</span>
              <span className="text-gray-500">2 мин назад</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 text-sm">
              <span className="text-gray-700">ETH/USD - Продажа</span>
              <span className="text-gray-500">5 мин назад</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 text-sm">
              <span className="text-gray-700">AAPL - Покупка</span>
              <span className="text-gray-500">12 мин назад</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
