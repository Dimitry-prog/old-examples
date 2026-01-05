import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createRouteGuard } from '@/shared/lib/guards/route-guard';

export const Route = createFileRoute('/_authenticated/dashboards')({
  beforeLoad: createRouteGuard('/_authenticated/dashboards'),
  component: DashboardsLayout,
});

function DashboardsLayout() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Дашборды</h1>
        <Outlet />
      </div>
    </div>
  );
}
