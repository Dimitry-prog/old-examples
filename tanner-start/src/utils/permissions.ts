// Утилиты для работы с правами доступа и фильтрации маршрутов

import type {
	Permission,
	RoutePermissions,
	UserPermissions,
} from "@/types/permissions";
import type {
	FilteredRoute,
	FilteredRoutesResult,
	RoutesConfig,
} from "@/types/routes";

/**
 * Проверка, является ли маршрут скрытым
 * Маршрут считается скрытым, если его permissions содержат специальное значение 'hidden'
 */
export function isHiddenRoute(routePermissions: RoutePermissions): boolean {
	return (
		Array.isArray(routePermissions) &&
		routePermissions.length === 1 &&
		routePermissions[0] === "hidden"
	);
}

/**
 * Проверка, имеет ли пользователь доступ к маршруту
 * @param routePermissions - права доступа, необходимые для маршрута
 * @param userPermissions - права доступа пользователя
 * @returns true, если пользователь имеет доступ к маршруту
 *
 * Логика:
 * - Если маршрут скрыт ('hidden'), доступ запрещен
 * - Если маршрут не требует прав доступа (пустой массив), доступ разрешен
 * - Если маршрут требует права доступа, пользователь должен иметь ВСЕ требуемые права
 */
export function checkRouteAccess(
	routePermissions: RoutePermissions,
	userPermissions: UserPermissions,
): boolean {
	// Скрытые маршруты недоступны
	if (isHiddenRoute(routePermissions)) {
		return false;
	}

	// Маршруты без требований к правам доступа доступны всем
	if (routePermissions.length === 0) {
		return true;
	}

	// Создаем Set для быстрого поиска
	const userPermissionsSet = new Set(userPermissions);

	// Проверяем, что пользователь имеет ВСЕ требуемые права
	return routePermissions.every((permission) =>
		userPermissionsSet.has(permission),
	);
}

/**
 * Получение первого доступного маршрута из списка
 * @param filteredRoutes - список отфильтрованных маршрутов
 * @param preferVisible - приоритизировать видимые маршруты (не скрытые из меню)
 * @returns первый доступный маршрут или null
 */
export function getFirstAccessibleRoute(
	filteredRoutes: FilteredRoute[],
	preferVisible = true,
): FilteredRoute | null {
	if (filteredRoutes.length === 0) {
		return null;
	}

	// Если нужно приоритизировать видимые маршруты
	if (preferVisible) {
		// Сначала ищем видимый маршрут
		const visibleRoute: FilteredRoute | undefined = filteredRoutes.find(
			(route) => !route.isHideInMenu && !isHiddenRoute(route.permissions),
		);

		if (visibleRoute) {
			return visibleRoute;
		}
	}

	// Возвращаем первый доступный маршрут (гарантированно существует после проверки length)
	return filteredRoutes[0] || null;
}

/**
 * Фильтрация маршрутов на основе прав доступа пользователя
 * @param routesConfig - конфигурация всех маршрутов приложения
 * @param userPermissions - права доступа пользователя
 * @param locale - текущая локаль для формирования полных путей
 * @returns результат фильтрации с доступными маршрутами
 */
export function filterRoutesByPermissions(
	routesConfig: RoutesConfig,
	userPermissions: UserPermissions,
	locale: string,
): FilteredRoutesResult {
	const routes: FilteredRoute[] = [];
	const groupedRoutes = new Map<string, FilteredRoute[]>();

	// Проходим по всем группам и маршрутам
	for (const group of routesConfig) {
		const groupRoutes: FilteredRoute[] = [];

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
	const firstRoute = (
		routes.length > 0 ? routes[0] : null
	) as FilteredRoute | null;

	// Получаем первый видимый маршрут (для редиректа по умолчанию)
	const firstVisibleRoute = getFirstAccessibleRoute(
		routes,
		true,
	) as FilteredRoute | null;

	return {
		routes,
		groupedRoutes,
		firstRoute,
		firstVisibleRoute,
	};
}

/**
 * Проверка наличия одного права доступа у пользователя
 */
export function hasPermission(
	userPermissions: UserPermissions,
	permission: Permission,
): boolean {
	return userPermissions.includes(permission);
}

/**
 * Проверка наличия всех прав доступа у пользователя
 */
export function hasAllPermissions(
	userPermissions: UserPermissions,
	permissions: Permission[],
): boolean {
	const userPermissionsSet = new Set(userPermissions);
	return permissions.every((permission) => userPermissionsSet.has(permission));
}

/**
 * Проверка наличия хотя бы одного права доступа у пользователя
 */
export function hasAnyPermission(
	userPermissions: UserPermissions,
	permissions: Permission[],
): boolean {
	const userPermissionsSet = new Set(userPermissions);
	return permissions.some((permission) => userPermissionsSet.has(permission));
}

/**
 * Проверка доступа к маршруту по пути
 * @param routePath - путь маршрута (без локали)
 * @param routesConfig - конфигурация маршрутов
 * @param userPermissions - права доступа пользователя
 * @returns true, если пользователь имеет доступ к маршруту
 */
export function canAccessRoute(
	routePath: string,
	routesConfig: RoutesConfig,
	userPermissions: UserPermissions,
): boolean {
	// Ищем маршрут в конфигурации
	for (const group of routesConfig) {
		const route = group.items.find((item) => item.path === routePath);
		if (route) {
			return checkRouteAccess(route.permissions, userPermissions);
		}
	}

	// Если маршрут не найден в конфигурации, считаем его недоступным
	return false;
}
