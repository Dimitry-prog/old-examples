import { createFileRoute, Link } from '@tanstack/react-router';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { useTranslation } from '@/shared/hooks/use-translation';

export const Route = createFileRoute('/_public/welcome')({
  component: WelcomeComponent,
});

function WelcomeComponent() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="mb-6 text-5xl font-bold text-gray-900">Добро пожаловать!</h1>
      <p className="mb-8 text-xl text-gray-600">
        Войдите в систему, чтобы получить доступ к вашему личному кабинету
        {t('welcome')}
        {t('main-page.description', 6)}
      </p>
      <LanguageSwitcher />
      <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold">🚀 Что вас ждет после входа:</h2>
        <div className="grid gap-6 text-left md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="mb-2 text-2xl">🏠</div>
            <h3 className="mb-2 font-medium">Личный кабинет</h3>
            <p className="text-sm text-gray-600">
              Персонализированная главная страница с вашей информацией
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="mb-2 text-2xl">📊</div>
            <h3 className="mb-2 font-medium">Панель управления</h3>
            <p className="text-sm text-gray-600">Доступ к расширенным функциям и настройкам</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="mb-2 text-2xl">🔐</div>
            <h3 className="mb-2 font-medium">Безопасность</h3>
            <p className="text-sm text-gray-600">Защищенные данные и персональные настройки</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Link
          to="/sign-in"
          search={{ redirect: '/' }}
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          Войти в систему
        </Link>

        <div className="mx-auto max-w-md rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <strong>Тестовые данные для входа:</strong>
          <br />
          Логин: <code>admin</code>
          <br />
          Пароль: <code>password</code>
        </div>
      </div>
    </div>
  );
}
