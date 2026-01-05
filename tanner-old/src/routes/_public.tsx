import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_public')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/profile',
        replace: true,
      });
    }
  },
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/welcome" className="text-xl font-bold text-gray-900">
                🏠 MyApp
              </Link>
            </div>

            <nav className="flex items-center space-x-4">
              <Link
                to="/welcome"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                О приложении
              </Link>
              <Link
                to="/sign-in"
                search={{ redirect: '/' }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Войти
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2024 MyApp. Все права защищены.</p>
            <div className="mt-2 space-x-4">
              <span className="text-gray-500">Политика конфиденциальности</span>
              <span className="text-gray-500">Условия использования</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
