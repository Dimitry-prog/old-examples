import { createFileRoute, Link, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/no-access')({
  component: NoAccessPage,
});

function NoAccessPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.history.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Доступ запрещен</h1>
          <p className="text-lg text-gray-600">
            У вас нет необходимых разрешений для доступа к этой странице
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="mb-6 text-sm text-gray-700">
            Если вы считаете, что это ошибка, обратитесь к администратору системы для получения
            необходимых прав доступа.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleGoBack}
              className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              ← Вернуться назад
            </button>
            <Link
              to="/"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🏠 На главную
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-500">
            Код ошибки: <span className="font-mono">403 - Forbidden</span>
          </p>
        </div>
      </div>
    </div>
  );
}
