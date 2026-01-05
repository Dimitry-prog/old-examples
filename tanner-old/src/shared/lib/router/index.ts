import { createRouter } from '@tanstack/react-router';
import type { MyRouterContext } from '@/routes/__root';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingMinMs: 0,
  context: {
    auth: undefined!,
    router: undefined!,
  } as MyRouterContext,
});

// Update router context with itself after creation
router.update({
  context: {
    ...router.options.context,
    router,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
