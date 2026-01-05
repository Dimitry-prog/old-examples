import { useRouter, useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { PermissionService } from '@/shared/services/permission.service';
import type { Permission } from '@/types/permissions';

/**
 * Хук для получения разрешений текущего маршрута
 * @returns массив разрешений для текущего маршрута
 */
export const useCurrentRoutePermissions = (): Permission[] => {
  const router = useRouter();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return useMemo(() => {
    // Находим соответствующий route ID
    const routeId = PermissionService.findRouteIdByPath(currentPath, router);
    return PermissionService.getRoutePermissions(routeId);
  }, [currentPath, router]);
};

/**
 * Хук для автоматической синхронизации конфигурации разрешений при изменении маршрутов
 */
export const useRouteConfigSync = (): void => {
  const router = useRouter();

  useEffect(() => {
    // Синхронизируем конфигурацию разрешений при монтировании
    PermissionService.syncRoutePermissions(router);

    // Подписываемся на изменения в router
    const unsubscribe = router.subscribe('onLoad', () => {
      // Обновляем конфигурацию разрешений при изменении маршрутов
      PermissionService.syncRoutePermissions(router);
    });

    return unsubscribe;
  }, [router]);
};

/**
 * Хук для проверки доступа к конкретному маршруту
 * @param routeId - ID маршрута для проверки
 * @returns true если пользователь имеет доступ к маршруту
 */
export const useHasRouteAccess = (routeId: string): boolean => {
  const router = useRouter();
  const routerState = useRouterState();

  return useMemo(() => {
    const context = router.options.context;
    if (!context?.auth) {
      return false;
    }

    const routePermissions = PermissionService.getRoutePermissions(routeId);

    // Если разрешения не требуются, доступ разрешен
    if (routePermissions.length === 0) {
      return true;
    }

    // Проверяем наличие хотя бы одного разрешения
    return context.auth.hasAnyPermission(routePermissions);
  }, [routeId, router, routerState]);
};
