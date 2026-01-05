import type { Permission, RouteConfig } from '@/types/permissions';

/**
 * Метаданные маршрута для отображения в UI
 */
export type RouteMetadata = {
  label: string;
  icon?: string;
  showInMenu?: boolean;
};

/**
 * Конфигурация разрешений для маршрутов
 * Используем route ID вместо hardcoded путей
 */
export const routePermissions: Record<string, Permission[]> = {
  // Группа dashboards
  '/_authenticated/dashboards': [],
  '/_authenticated/dashboards/main-dashboard': ['dashboards:main:read'],
  '/_authenticated/dashboards/trading-dashboard': ['dashboards:trading:read'],

  // Отдельные маршруты
  '/_authenticated/data-smith': ['data:read', 'data:write'],
  '/_authenticated/users': ['users:read'],
};

/**
 * Метаданные маршрутов для отображения
 */
export const routeMetadata: Record<string, RouteMetadata> = {
  '/_authenticated/dashboards/main-dashboard': {
    label: 'Главный дашборд',
    icon: '📊',
    showInMenu: true,
  },
  '/_authenticated/dashboards/trading-dashboard': {
    label: 'Торговый дашборд',
    icon: '📈',
    showInMenu: true,
  },
  '/_authenticated/data-smith': {
    label: 'Data Smith',
    icon: '🔧',
    showInMenu: true,
  },
  '/_authenticated/users': {
    label: 'Пользователи',
    icon: '👥',
    showInMenu: true,
  },
  '/_authenticated/profile': {
    label: 'Профиль',
    icon: '👤',
    showInMenu: false, // Не показываем в основном меню
  },
  '/_authenticated/settings': {
    label: 'Настройки',
    icon: '⚙️',
    showInMenu: false, // Не показываем в основном меню
  },
};

/**
 * Получение разрешений для конкретного route ID
 */
export const getRoutePermissions = (routeId: string): Permission[] => {
  return routePermissions[routeId] || [];
};

/**
 * Получение метаданных для конкретного route ID
 */
export const getRouteMetadata = (routeId: string): RouteMetadata | undefined => {
  return routeMetadata[routeId];
};

/**
 * Валидация конфигурации - проверяет, что все маршруты с разрешениями имеют метаданные
 * Полезно для отладки в development режиме
 */
export const validateRouteConfiguration = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const routesWithPermissions = Object.keys(routePermissions);
    const routesWithMetadata = Object.keys(routeMetadata);

    routesWithPermissions.forEach((routeId) => {
      if (!routesWithMetadata.includes(routeId) && routePermissions[routeId].length > 0) {
        console.warn(
          `⚠️ Маршрут "${routeId}" имеет разрешения, но не имеет метаданных для отображения`
        );
      }
    });
  }
};

/**
 * Динамическое получение конфигурации маршрутов из router instance
 */
export const getRouteConfigs = (router: any): RouteConfig[] => {
  const routes: RouteConfig[] = [];

  // Получаем все маршруты из router
  const allRoutes = router.routeTree.children || [];

  for (const route of allRoutes) {
    const routeId = route.id;
    const permissions = routePermissions[routeId] || [];
    const metadata = routeMetadata[routeId];

    // Добавляем маршрут если у него есть разрешения, метаданные или дочерние элементы
    if (permissions.length > 0 || metadata || route.children) {
      routes.push({
        routeId,
        permissions,
        isGroup: !!route.children,
        metadata,
        children: route.children ? getChildRouteConfigs(route.children) : undefined,
      });
    }
  }

  return routes;
};

/**
 * Получение конфигурации дочерних маршрутов
 */
export const getChildRouteConfigs = (children: any[]): RouteConfig[] => {
  return children.map((child) => ({
    routeId: child.id,
    permissions: routePermissions[child.id] || [],
    isGroup: !!child.children,
    metadata: routeMetadata[child.id],
    children: child.children ? getChildRouteConfigs(child.children) : undefined,
  }));
};
