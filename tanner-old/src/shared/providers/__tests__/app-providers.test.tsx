import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../index';

vi.mock('@/shared/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

vi.mock('@/shared/providers/router-provider', () => ({
  RouterProvider: () => <div data-testid="router-provider">Router</div>,
}));

vi.mock('@/shared/providers/toast-provider', () => ({
  ToastProvider: () => <div data-testid="toast-provider">Toast</div>,
}));

describe('AppProviders', () => {
  it('renders all providers in correct order', () => {
    const { getByTestId } = render(<AppProviders />);

    expect(getByTestId('query-provider')).toBeInTheDocument();
    expect(getByTestId('router-provider')).toBeInTheDocument();
    expect(getByTestId('toast-provider')).toBeInTheDocument();
  });

  it('wraps router and toast providers with query provider', () => {
    const { getByTestId } = render(<AppProviders />);

    const queryProvider = getByTestId('query-provider');
    const routerProvider = getByTestId('router-provider');
    const toastProvider = getByTestId('toast-provider');

    expect(queryProvider).toContainElement(routerProvider);
    expect(queryProvider).toContainElement(toastProvider);
  });
});
