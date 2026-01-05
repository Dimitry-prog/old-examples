// Утилиты для работы с правами доступа

import type { RoutePermissions, UserPermissions } from "@/types/permissions";
import type {
	FilteredRoute,
	FilteredRoutesResult,
	RoutesConfig,
} from "@/types/routes";

/**
 * Проверка, является ли маршрут скрытым
 */
export function isHiddenRoute(routePermissions: RoutePermissions): boolean {
	return routePermissions.length === 1 && routePermissions[0] === "hidden";
}

/**
 * Проверка, имеет ли пользователь доступ к маршруту
 * @param routePermissions - права доступа, необходимые для маршрута
 * @param userPermissions - права доступа пользователя
 * @returns true, если пользователь имеет доступ к маршруту
 */
export function checkRouteAccess(
	routePermissions: RoutePermissions,
	userPermissions: UserPermissions,
): boolean {
	// Если маршрут скрыт, доступ запрещен
	if (isHiddenRoute(routePermissions)) {
		return false;
	}

	// Если маршрут не требует прав доступа, доступ разрешен
	if (routePermissions.length === 0) {
		return true;
	}

	// Создаем Set для быстрого поиска
	const userPermissionsSet = new Set(userPermissions);

	// Проверяем, что у пользователя есть все требуемые права доступа
	return routePermissions.every((permission) =>
		userPermissionsSet.has(permission),
	);
}

/**
 * Получение первого доступного маршрута
 * @param filteredRoutes - отфильтрованные маршруты
 * @param preferVisible - предпочитать видимые маршруты (не скрытые из меню)
 * @returns первый доступный маршрут или null
 */
export function getFirstAccessibleRoute(
	filteredRoutes: FilteredRoute[],
	preferVisible = true,
): FilteredRoute | null {
	if (filteredRoutes.length === 0) {
		return null;
	}

	if (preferVisible) {
		// Сначала ищем первый видимый маршрут
		const visibleRoute = filteredRoutes.find((route) => !route.isHideInMenu);
		if (visibleRoute) {
			return visibleRoute;
		}
	}

	// Возвращаем первый маршрут (видимый или скрытый)
	return filteredRoutes[0] ?? null;
}

/**
 * Фильтрация маршрутов на основе прав доступа пользователя
 * @param routesConfig - конфигурация маршрутов
 * @param userPermissions - права доступа пользователя
 * @param locale - текущая локаль
 * @returns отфильтрованные маршруты с дополнительной информацией
 */
export function filterRoutesByPermissions(
	routesConfig: RoutesConfig,
	userPermissions: UserPermissions,
	locale: string,
): FilteredRoutesResult {
	const routes: FilteredRoute[] = [];
	const groupedRoutes = new Map<string, FilteredRoute[]>();

	// Проходим по всем группам маршрутов
	for (const group of routesConfig) {
		const groupRoutes: FilteredRoute[] = [];

		// Проходим по всем маршрутам в группе
		for (const route of group.items) {
			// Проверяем доступ к маршруту
			if (checkRouteAccess(route.permissions, userPermissions)) {
				const filteredRoute: FilteredRoute = {
					...route,
					fullPath: `/${locale}/${route.path}`,
					group: group.group,
				};

				routes.push(filteredRoute);
				groupRoutes.push(filteredRoute);
			}
		}

		// Добавляем группу только если в ней есть доступные маршруты
		if (groupRoutes.length > 0) {
			groupedRoutes.set(group.group, groupRoutes);
		}
	}

	// Получаем первый доступный маршрут
	const firstRoute = getFirstAccessibleRoute(routes, false);

	// Получаем первый видимый маршрут
	const firstVisibleRoute = getFirstAccessibleRoute(routes, true);

	return {
		routes,
		groupedRoutes,
		firstRoute,
		firstVisibleRoute,
	};
}
