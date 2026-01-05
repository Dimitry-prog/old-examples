import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { MenuFilter } from '@/shared/components/menu-filter/menu-filter';
import { PermissionGuard } from '@/shared/components/permission-guard/permission-guard';
import { getRouteMetadata } from '@/config/routes-permissions.config';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
  component: AuthenticatedLayout,
});

/**
 * Преобразует route ID в путь для навигации
 * Удаляет layout-префиксы (начинающиеся с _) из route ID
 * Например: '/_authenticated/dashboards/main-dashboard' -> '/dashboards/main-dashboard'
 */
const routeIdToPath = (routeId: string): string => {
  // Разбиваем на сегменты и удаляем те, что начинаются с _
  const segments = routeId.split('/').filter((segment) => segment && !segment.startsWith('_'));
  return '/' + segments.join('/');
};

function AuthenticatedLayout() {
  const { auth } = Route.useRouteContext();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                🏠 MyApp
              </Link>
            </div>

            <nav className="flex items-center space-x-4">
              <MenuFilter>
                {(filteredRoutes) => (
                  <>
                    {filteredRoutes
                      .filter((route) => route.metadata?.showInMenu !== false)
                      .map((route) => {
                        const metadata = route.metadata;
                        if (!metadata) return null;

                        const path = routeIdToPath(route.routeId);

                        return (
                          <Link
                            key={route.routeId}
                            to={path}
                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                            activeProps={{ className: 'text-blue-600 bg-blue-50' }}
                          >
                            {metadata.icon && `${metadata.icon} `}
                            {metadata.label}
                          </Link>
                        );
                      })}
                  </>
                )}
              </MenuFilter>

              {/* Профиль и настройки всегда доступны */}
              <Link
                to="/profile"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                activeProps={{ className: 'text-blue-600 bg-blue-50' }}
              >
                {getRouteMetadata('/_authenticated/profile')?.icon} Профиль
              </Link>
              <Link
                to="/settings"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                activeProps={{ className: 'text-blue-600 bg-blue-50' }}
              >
                {getRouteMetadata('/_authenticated/settings')?.icon} Настройки
              </Link>

              <div className="ml-4 flex items-center space-x-3 border-l pl-4">
                <span className="text-sm text-gray-600">Привет, {auth.user?.username}!</span>
                <PermissionGuard permissions={['admin:access']}>
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                    Admin
                  </span>
                </PermissionGuard>
                <button
                  onClick={() => auth.logout()}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
                >
                  Выйти
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
