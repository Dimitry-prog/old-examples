// Типы для системы прав доступа

import type { ReactNode } from "react";

/**
 * Строка права доступа (например, '/api.manager.dashboard.view')
 */
export type Permission = string;

/**
 * Массив прав доступа пользователя
 */
export type UserPermissions = Permission[];

/**
 * Специальное значение для скрытых маршрутов
 */
export type HiddenPermission = "hidden";

/**
 * Права доступа маршрута: массив строк или специальное значение 'hidden'
 */
export type RoutePermissions = Permission[] | [HiddenPermission] | [];

/**
 * Ответ API с правами доступа пользователя
 */
export type PermissionsApiResponse = {
	permissions: UserPermissions;
	timestamp: number;
};

/**
 * Состояние загрузки прав доступа
 */
export type PermissionsLoadingState = "idle" | "loading" | "success" | "error";

/**
 * Ошибка прав доступа
 */
export type PermissionError = {
	type: "permission_denied" | "permission_load_failed" | "invalid_permission";
	message: string;
	requiredPermissions?: Permission[];
	userPermissions?: UserPermissions;
};

/**
 * Контекст прав доступа
 */
export type PermissionContextValue = {
	/** Права доступа пользователя */
	permissions: UserPermissions;

	/** Состояние загрузки */
	isLoading: boolean;

	/** Ошибка загрузки */
	error: Error | null;

	/** Отфильтрованные маршруты */
	filteredRoutes: FilteredRoutesResult;

	/** Проверка наличия права доступа */
	hasPermission: (permission: Permission) => boolean;

	/** Проверка наличия всех прав доступа */
	hasAllPermissions: (permissions: Permission[]) => boolean;

	/** Проверка наличия хотя бы одного права доступа */
	hasAnyPermission: (permissions: Permission[]) => boolean;

	/** Проверка доступа к маршруту */
	canAccessRoute: (routePath: string) => boolean;

	/** Перезагрузка прав доступа */
	refetchPermissions: () => Promise<void>;
};

/**
 * Пропсы провайдера прав доступа
 */
export type PermissionProviderProps = {
	children: ReactNode;

	/** Конфигурация маршрутов */
	routesConfig: RoutesConfig;

	/** Функция для загрузки прав доступа */
	fetchPermissions?: () => Promise<UserPermissions>;
};

// Импорт типов маршрутов (будут определены в routes.ts)
import type { FilteredRoutesResult, RoutesConfig } from "./routes";
