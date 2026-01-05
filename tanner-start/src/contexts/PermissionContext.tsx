// Контекст для управления правами доступа пользователя

import { permissionsApi } from "@/api/permissions";
import type {
	Permission,
	PermissionContextValue,
	UserPermissions,
} from "@/types/permissions";
import type { FilteredRoutesResult, RoutesConfig } from "@/types/routes";
import { filterRoutesByPermissions } from "@/utils/permissions";
import { useParams } from "@tanstack/react-router";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

/**
 * Контекст прав доступа
 */
const PermissionContext = createContext<PermissionContextValue | undefined>(
	undefined,
);

/**
 * Пропсы провайдера прав доступа
 */
type PermissionProviderProps = {
	children: ReactNode;
	routesConfig: RoutesConfig;
	fetchPermissions?: () => Promise<UserPermissions>;
};

/**
 * Провайдер прав доступа
 * Управляет загрузкой, кэшированием и фильтрацией прав доступа пользователя
 */
export function PermissionProvider({
	children,
	routesConfig,
	fetchPermissions = permissionsApi.fetchUserPermissions,
}: PermissionProviderProps) {
	const [permissions, setPermissions] = useState<UserPermissions>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Получаем текущую локаль из параметров маршрута
	const params = useParams({ strict: false });
	const locale = (params as { locale?: string }).locale || "en";

	/**
	 * Загрузка прав доступа
	 */
	const loadPermissions = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const userPermissions = await fetchPermissions();
			setPermissions(userPermissions);

			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.log(
					"[PermissionProvider] Loaded permissions:",
					userPermissions,
				);
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setError(error);
			console.error("[PermissionProvider] Failed to load permissions:", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchPermissions]);

	/**
	 * Загрузка прав доступа при монтировании
	 */
	useEffect(() => {
		loadPermissions();
	}, [loadPermissions]);

	/**
	 * Фильтрация маршрутов на основе прав доступа
	 * Мемоизируем результат для оптимизации производительности
	 */
	const filteredRoutes = useMemo<FilteredRoutesResult>(() => {
		const result = filterRoutesByPermissions(routesConfig, permissions, locale);

		// Логирование в dev режиме
		if (process.env.NODE_ENV === "development") {
			console.log("[PermissionProvider] Filtered routes:", {
				totalRoutes: result.routes.length,
				groups: result.groupedRoutes.size,
				firstRoute: result.firstRoute?.path,
				firstVisibleRoute: result.firstVisibleRoute?.path,
			});
		}

		return result;
	}, [routesConfig, permissions, locale]);

	/**
	 * Создаем Set для быстрой проверки прав доступа
	 */
	const permissionsSet = useMemo(() => new Set(permissions), [permissions]);

	/**
	 * Проверка наличия права доступа
	 */
	const hasPermission = useCallback(
		(permission: Permission): boolean => {
			const result = permissionsSet.has(permission);

			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.log(
					`[PermissionProvider] Check permission "${permission}":`,
					result,
				);
			}

			return result;
		},
		[permissionsSet],
	);

	/**
	 * Проверка наличия всех прав доступа
	 */
	const hasAllPermissions = useCallback(
		(requiredPermissions: Permission[]): boolean => {
			const result = requiredPermissions.every((permission) =>
				permissionsSet.has(permission),
			);

			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.log(
					`[PermissionProvider] Check all permissions [${requiredPermissions.join(", ")}]:`,
					result,
				);
			}

			return result;
		},
		[permissionsSet],
	);

	/**
	 * Проверка наличия хотя бы одного права доступа
	 */
	const hasAnyPermission = useCallback(
		(requiredPermissions: Permission[]): boolean => {
			const result = requiredPermissions.some((permission) =>
				permissionsSet.has(permission),
			);

			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.log(
					`[PermissionProvider] Check any permission [${requiredPermissions.join(", ")}]:`,
					result,
				);
			}

			return result;
		},
		[permissionsSet],
	);

	/**
	 * Проверка доступа к маршруту по пути
	 */
	const canAccessRoute = useCallback(
		(routePath: string): boolean => {
			// Нормализуем путь (убираем локаль если есть)
			const normalizedPath = routePath.replace(`/${locale}/`, "");

			// Ищем маршрут в отфильтрованных маршрутах
			const route = filteredRoutes.routes.find(
				(r) => r.path === normalizedPath || r.fullPath === routePath,
			);

			const result = route !== undefined;

			// Логирование в dev режиме
			if (process.env.NODE_ENV === "development") {
				console.log(
					`[PermissionProvider] Check route access "${routePath}":`,
					result,
				);
			}

			return result;
		},
		[filteredRoutes.routes, locale],
	);

	/**
	 * Перезагрузка прав доступа
	 */
	const refetchPermissions = useCallback(async () => {
		await loadPermissions();
	}, [loadPermissions]);

	/**
	 * Значение контекста
	 */
	const contextValue = useMemo<PermissionContextValue>(
		() => ({
			permissions,
			isLoading,
			error,
			filteredRoutes,
			hasPermission,
			hasAllPermissions,
			hasAnyPermission,
			canAccessRoute,
			refetchPermissions,
		}),
		[
			permissions,
			isLoading,
			error,
			filteredRoutes,
			hasPermission,
			hasAllPermissions,
			hasAnyPermission,
			canAccessRoute,
			refetchPermissions,
		],
	);

	return (
		<PermissionContext.Provider value={contextValue}>
			{children}
		</PermissionContext.Provider>
	);
}

/**
 * Хук для использования контекста прав доступа
 * @throws Error если используется вне PermissionProvider
 */
export function usePermissionContext(): PermissionContextValue {
	const context = useContext(PermissionContext);

	if (context === undefined) {
		throw new Error(
			"usePermissionContext must be used within a PermissionProvider",
		);
	}

	return context;
}
