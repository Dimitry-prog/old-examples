import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router';
import { useAuth } from '@/shared/lib/auth';
import { router } from '@/shared/lib/router';

export const RouterProvider = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <div className="mb-2 text-lg text-gray-600">Загрузка...</div>
          <div className="text-sm text-gray-500">Проверка аутентификации</div>
        </div>
      </div>
    );
  }

  return <TanStackRouterProvider router={router} context={{ auth, router }} />;
};
