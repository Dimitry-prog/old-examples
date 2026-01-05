import { StrictMode } from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import type { router } from '@/shared/lib/router';
import { AppProviders } from '@/shared/providers';
import { validateRouteConfiguration } from '@/config/routes-permissions.config';

// Initialize i18n
import './i18n';

// Validate route configuration in development
validateRouteConfiguration();

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppProviders />
    </StrictMode>
  );
}
