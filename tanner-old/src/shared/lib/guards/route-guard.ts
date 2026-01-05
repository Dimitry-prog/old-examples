import { redirect } from '@tanstack/react-router';
import type { MyRouterContext } from '@/routes/__root';
import { PermissionService } from '@/shared/services/permission.service';
import type { Permission } from '@/types/permissions';

/**
 * Хук для защиты маршрутов с автоматическим получением разрешений
 * @param routeId - ID маршрута из TanStack Router
 * @param requireAll - требуются ли все разрешения (по умолчанию false - достаточно любого)
 */
export const useRouteGuard = (routeId: string, requireAll = false) => {
  return ({ context, location }: { context: MyRouterContext; location: any }) => {
    const { auth, router } = context;

    // Проверка аутентификации
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    // Получаем разрешения для текущего маршрута из конфигурации
    const routePermissions = PermissionService.getRoutePermissions(routeId);

    // Если разрешения не требуются, разрешаем доступ
    if (routePermissions.length === 0) {
      return;
    }

    // Проверяем доступ
    const hasAccess = requireAll
      ? auth.hasAllPermissions(routePermissions)
      : auth.hasAnyPermission(routePermissions);

    if (!hasAccess) {
      // Перенаправление на первый доступный маршрут
      const firstAccessibleRoute = PermissionService.getFirstAccessibleRoute(
        auth.permissions,
        router
      );

      if (firstAccessibleRoute) {
        throw redirect({ to: firstAccessibleRoute });
      } else {
        throw redirect({ to: '/no-access' });
      }
    }
  };
};

/**
 * Упрощенная функция для создания beforeLoad с проверкой разрешений
 * @param routeId - ID маршрута из TanStack Router
 * @param requireAll - требуются ли все разрешения (по умолчанию false)
 */
export const createRouteGuard = (routeId: string, requireAll = false) => {
  return useRouteGuard(routeId, requireAll);
};

/**
 * Создание guard для маршрута с кастомными разрешениями
 * @param permissions - массив требуемых разрешений
 * @param requireAll - требуются ли все разрешения (по умолчанию false)
 */
export const createPermissionGuard = (
  permissions: Permission[],
  requireAll = false
) => {
  return ({ context, location }: { context: MyRouterContext; location: any }) => {
    const { auth, router } = context;

    // Проверка аутентификации
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    // Если разрешения не требуются, разрешаем доступ
    if (permissions.length === 0) {
      return;
    }

    // Проверяем доступ
    const hasAccess = requireAll
      ? auth.hasAllPermissions(permissions)
      : auth.hasAnyPermission(permissions);

    if (!hasAccess) {
      // Перенаправление на первый доступный маршрут
      const firstAccessibleRoute = PermissionService.getFirstAccessibleRoute(
        auth.permissions,
        router
      );

      if (firstAccessibleRoute) {
        throw redirect({ to: firstAccessibleRoute });
      } else {
        throw redirect({ to: '/no-access' });
      }
    }
  };
};
