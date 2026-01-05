import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_public/sign-in')({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || '/profile',
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: search.redirect,
        replace: true,
      });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const { auth } = Route.useRouteContext();
  const { redirect } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await fetch('api.guest');
      // await auth.login(username, password);
      // Переходим на страницу редиректа используя навигацию роутера
      // Проверяем доступность redirect URL и используем безопасное перенаправление
      // const safeRedirectPaths = [
      //   '/',
      //   '/profile',
      //   '/settings',
      //   '/profile/payment-methods',
      //   '/profile/shipping-address',
      // ];
      // const targetPath = safeRedirectPaths.includes(redirect)
      //   ? redirect
      //   : '/profile';
      //
      // navigate({
      //   to: targetPath as '/',
      //   replace: true,
      // });
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 shadow-md"
      >
        <h1 className="text-center text-2xl font-bold">Вход в систему</h1>

        <div className="rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <strong>Тестовые данные:</strong>
          <br />
          Логин: admin
          <br />
          Пароль: password
        </div>

        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Имя пользователя
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
