// Permission guard для TanStack Router

import type { RoutePermissions } from "@/types/permissions";
import { redirect } from "@tanstack/react-router";

/**
 * Создание guard для проверки прав доступа
 * Используется в beforeLoad хуке TanStack Router
 *
 * @param requiredPermissions - права доступа, необходимые для доступа к маршруту
 * @returns функция guard для использования в beforeLoad
 *
 * @example
 * ```tsx
 * export const Route = createFileRoute("/$locale/_layout/_authenticated/dashboard")({
 *   beforeLoad: createPermissionGuard([
 *     '/api.manager.dashboard.view',
 *     '/api.manager.dashboard.stats'
 *   ]),
 *   component: DashboardPage
 * })
 * ```
 */
export function createPermissionGuard(requiredPermissions: RoutePermissions) {
	return async (opts: any) => {
		const { context, params } = opts;
		// Получаем контекст прав доступа
		const permissionContext = context.permissionContext as any;

		if (!permissionContext) {
			console.error(
				"[PermissionGuard] PermissionContext not found in route context",
			);
			const locale = params.locale || "en";
			throw redirect({
				to: "/$locale/login",
				params: { locale },
			});
		}

		// Ждем загрузки прав доступа
		if (permissionContext.isLoading) {
			// В реальном приложении здесь можно показать загрузку
			// Пока просто ждем
			return;
		}

		// Проверяем наличие ошибки загрузки
		if (permissionContext.error) {
			console.error(
				"[PermissionGuard] Failed to load permissions:",
				permissionContext.error,
			);
			const locale = params.locale || "en";
			throw redirect({
				to: "/$locale/login",
				params: { locale },
			});
		}

		// Если маршрут не требует прав доступа, разрешаем доступ
		if (requiredPermissions.length === 0) {
			return;
		}

		// Проверяем права доступа
		const hasAccess = permissionContext.hasAllPermissions(requiredPermissions);

		if (!hasAccess) {
			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[PermissionGuard] Access denied. Required permissions:",
					requiredPermissions,
					"User permissions:",
					permissionContext.permissions,
				);
			}

			// Получаем первый доступный маршрут для редиректа
			const firstRoute = permissionContext.filteredRoutes.firstVisibleRoute;

			if (firstRoute) {
				throw redirect({
					to: firstRoute.fullPath,
				});
			}

			// Если нет доступных маршрутов, редиректим на страницу входа
			const locale = params.locale || "en";
			throw redirect({
				to: "/$locale/login",
				params: { locale },
			});
		}
	};
}
/**
 * Простой guard для проверки одного права доступа
 * @param permission - право доступа для проверки
 */
export function createSinglePermissionGuard(permission: string) {
	return createPermissionGuard([permission]);
}

/**
 * Guard для маршрутов, доступных всем аутентифицированным пользователям
 * Не требует никаких прав доступа
 */
export function createAuthenticatedGuard() {
	return createPermissionGuard([]);
}

/**
 * Утилита для комбинирования guards
 * Позволяет объединить проверку аутентификации и прав доступа
 */
export function combineGuards(...guards: Array<(opts: any) => Promise<void>>) {
	return async (opts: any) => {
		for (const guard of guards) {
			await guard(opts);
		}
	};
}

/**
 * Guard для проверки, что пользователь НЕ имеет определенных прав
 * Полезно для скрытия маршрутов от определенных ролей
 */
export function createExclusionGuard(excludedPermissions: RoutePermissions) {
	return async (opts: any) => {
		const { context } = opts;
		const permissionContext = context.permissionContext as any;

		if (!permissionContext || permissionContext.isLoading) {
			return;
		}

		// Если пользователь имеет любое из исключенных прав, блокируем доступ
		const hasExcludedPermission =
			permissionContext.hasAnyPermission(excludedPermissions);

		if (hasExcludedPermission) {
			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[ExclusionGuard] Access denied. User has excluded permissions:",
					excludedPermissions,
				);
			}

			// Редиректим на первый доступный маршрут
			const firstRoute = permissionContext.filteredRoutes.firstVisibleRoute;
			if (firstRoute) {
				throw redirect({
					to: firstRoute.fullPath,
				});
			}
		}
	};
}

/**
 * Условный guard - проверяет права доступа только при выполнении условия
 * @param condition - функция, возвращающая boolean
 * @param requiredPermissions - права доступа для проверки
 */
export function createConditionalGuard(
	condition: (opts: any) => boolean,
	requiredPermissions: RoutePermissions,
) {
	return async (opts: any) => {
		if (condition(opts)) {
			const guard = createPermissionGuard(requiredPermissions);
			await guard(opts);
		}
	};
}
