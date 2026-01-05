import { AuthProvider } from '@/shared/lib/auth';
import { I18nProvider } from '@/shared/providers/i18n-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import { RouterProvider } from '@/shared/providers/router-provider';
import { ToastProvider } from '@/shared/providers/toast-provider';

export const AppProviders = () => (
  <I18nProvider>
    <AuthProvider>
      <QueryProvider>
        <RouterProvider />
        <ToastProvider />
      </QueryProvider>
    </AuthProvider>
  </I18nProvider>
);
