import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/welcome',
        replace: true,
      });
    }
    throw redirect({
      to: '/profile',
      replace: true,
    });
  },
});
