import type React from 'react';
import { useMemo } from 'react';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { getRouteConfigs } from '@/config/routes-permissions.config';
import type { RouteConfig } from '@/types/permissions';

type MenuFilterProps = {
  children: (filteredRoutes: RouteConfig[]) => React.ReactNode;
};

/**
 * Компонент для фильтрации меню на основе разрешений пользователя
 * Динамически получает маршруты из router и фильтрует их по доступу
 */
export const MenuFilter: React.FC<MenuFilterProps> = ({ children }) => {
  const router = useRouter();
  const routerState = useRouterState();

  // Получаем auth из контекста router
  const auth = router.options.context?.auth;

  // Получаем конфигурацию маршрутов динамически из router
  const routes = useMemo(() => getRouteConfigs(router), [router]);

  /**
   * Рекурсивная фильтрация маршрутов на основе разрешений
   */
  const filterRoutes = useMemo(() => {
    const filter = (routesToFilter: RouteConfig[]): RouteConfig[] => {
      return routesToFilter
        .filter((route) => {
          if (route.children) {
            // Для групп: показываем если есть доступ хотя бы к одной дочерней странице
            const accessibleChildren = filter(route.children);
            return accessibleChildren.length > 0;
          } else {
            // Для отдельных маршрутов: проверяем разрешения
            if (route.permissions.length === 0) {
              return true; // Маршруты без разрешений доступны всем
            }
            return auth?.hasAnyPermission(route.permissions) ?? false;
          }
        })
        .map((route) => ({
          ...route,
          children: route.children ? filter(route.children) : undefined,
        }));
    };

    return filter;
  }, [auth]);

  // Применяем фильтрацию к маршрутам
  const filteredRoutes = useMemo(
    () => filterRoutes(routes),
    [routes, filterRoutes, routerState]
  );

  return <>{children(filteredRoutes)}</>;
};
