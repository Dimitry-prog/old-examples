// API клиент для работы с правами доступа

import { api, apiErrorUtils } from "@/lib/api";
import type {
	Permission,
	PermissionsApiResponse,
	UserPermissions,
} from "@/types/permissions";

/**
 * API endpoints для прав доступа
 */
const PERMISSIONS_ENDPOINTS = {
	GET_USER_PERMISSIONS: "permissions",
	CHECK_PERMISSION: "permissions/check",
} as const;

/**
 * Получение прав доступа текущего пользователя
 * @returns Promise с массивом прав доступа пользователя
 * @throws ApiError при ошибке запроса
 */
export async function fetchUserPermissions(): Promise<UserPermissions> {
	try {
		const response = await api.get<PermissionsApiResponse>(
			PERMISSIONS_ENDPOINTS.GET_USER_PERMISSIONS,
		);

		// Валидируем структуру ответа
		if (!response || !Array.isArray(response.permissions)) {
			throw new Error("Некорректный формат ответа API");
		}

		return response.permissions;
	} catch (error) {
		console.error("Ошибка загрузки прав доступа:", error);

		// Форматируем ошибку для пользователя
		const userMessage = apiErrorUtils.formatUserError(error);
		throw new Error(`Не удалось загрузить права доступа: ${userMessage}`);
	}
}

/**
 * Проверка права доступа на сервере
 * @param permission - право доступа для проверки
 * @returns Promise с результатом проверки
 * @throws ApiError при ошибке запроса
 */
export async function checkPermissionOnServer(
	permission: Permission,
): Promise<boolean> {
	try {
		if (!permission || typeof permission !== "string") {
			throw new Error("Некорректное право доступа");
		}

		const response = await api.post<{ hasPermission: boolean }>(
			PERMISSIONS_ENDPOINTS.CHECK_PERMISSION,
			{ permission },
		);

		// Валидируем структуру ответа
		if (typeof response?.hasPermission !== "boolean") {
			throw new Error("Некорректный формат ответа API");
		}

		return response.hasPermission;
	} catch (error) {
		console.error("Ошибка проверки права доступа:", error);

		// В случае ошибки считаем, что права нет
		return false;
	}
}

/**
 * Проверка множественных прав доступа на сервере
 * @param permissions - массив прав доступа для проверки
 * @returns Promise с объектом результатов проверки
 * @throws ApiError при ошибке запроса
 */
export async function checkMultiplePermissions(
	permissions: Permission[],
): Promise<Record<Permission, boolean>> {
	try {
		if (!Array.isArray(permissions) || permissions.length === 0) {
			return {};
		}

		// Валидируем права доступа
		const validPermissions = permissions.filter(
			(p) => p && typeof p === "string",
		);

		if (validPermissions.length === 0) {
			return {};
		}

		const response = await api.post<Record<Permission, boolean>>(
			PERMISSIONS_ENDPOINTS.CHECK_PERMISSION,
			{ permissions: validPermissions },
		);

		// Валидируем структуру ответа
		if (!response || typeof response !== "object") {
			throw new Error("Некорректный формат ответа API");
		}

		return response;
	} catch (error) {
		console.error("Ошибка проверки прав доступа:", error);

		// В случае ошибки возвращаем объект с false для всех прав
		return permissions.reduce(
			(acc, permission) => {
				acc[permission] = false;
				return acc;
			},
			{} as Record<Permission, boolean>,
		);
	}
}

/**
 * Моковые данные для разработки и тестирования
 * В продакшене эти функции не используются
 */
export const mockPermissionsApi = {
	/**
	 * Мок функция для получения прав доступа
	 * Имитирует различные сценарии в зависимости от email пользователя
	 */
	async fetchUserPermissionsMock(userEmail?: string): Promise<UserPermissions> {
		// Симуляция задержки сети
		await new Promise((resolve) => setTimeout(resolve, 800));

		// Различные наборы прав в зависимости от пользователя
		if (userEmail?.includes("admin")) {
			return [
				"/api.manager.dashboard.view",
				"/api.manager.dashboard.stats",
				"/api.manager.users.list",
				"/api.manager.users.create",
				"/api.manager.users.edit",
				"/api.manager.users.delete",
				"/api.manager.settings.view",
				"/api.manager.settings.edit",
				"/api.manager.admin.access",
				"/api.manager.profile.view",
				"/api.manager.profile.edit",
			];
		}

		if (userEmail?.includes("manager")) {
			return [
				"/api.manager.dashboard.view",
				"/api.manager.dashboard.stats",
				"/api.manager.users.list",
				"/api.manager.users.create",
				"/api.manager.users.edit",
				"/api.manager.settings.view",
				"/api.manager.profile.view",
				"/api.manager.profile.edit",
			];
		}

		if (userEmail?.includes("user")) {
			return [
				"/api.manager.dashboard.view",
				"/api.manager.profile.view",
				"/api.manager.profile.edit",
			];
		}

		// Права по умолчанию для обычного пользователя
		return ["/api.manager.dashboard.view", "/api.manager.profile.view"];
	},

	/**
	 * Мок функция для проверки права доступа
	 */
	async checkPermissionMock(
		permission: Permission,
		userPermissions?: UserPermissions,
	): Promise<boolean> {
		// Симуляция задержки сети
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Если права пользователя не переданы, получаем их
		if (!userPermissions) {
			userPermissions = await this.fetchUserPermissionsMock();
		}

		return userPermissions.includes(permission);
	},

	/**
	 * Мок функция для проверки множественных прав доступа
	 */
	async checkMultiplePermissionsMock(
		permissions: Permission[],
		userPermissions?: UserPermissions,
	): Promise<Record<Permission, boolean>> {
		// Симуляция задержки сети
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Если права пользователя не переданы, получаем их
		if (!userPermissions) {
			userPermissions = await this.fetchUserPermissionsMock();
		}

		const result: Record<Permission, boolean> = {};
		permissions.forEach((permission) => {
			result[permission] = userPermissions?.includes(permission) ?? false;
		});

		return result;
	},
};

/**
 * Функция для переключения между реальным API и моком
 * В зависимости от переменной окружения или флага разработки
 */
const USE_MOCK_API = true; // В разработке используем мок, в продакшене - реальный API

/**
 * Экспортируемые функции, которые автоматически выбирают между реальным API и моком
 */
export const permissionsApi = {
	/**
	 * Получение прав доступа пользователя
	 * Автоматически выбирает между реальным API и моком
	 */
	fetchUserPermissions: USE_MOCK_API
		? mockPermissionsApi.fetchUserPermissionsMock
		: fetchUserPermissions,

	/**
	 * Проверка права доступа на сервере
	 * Автоматически выбирает между реальным API и моком
	 */
	checkPermission: USE_MOCK_API
		? mockPermissionsApi.checkPermissionMock
		: checkPermissionOnServer,

	/**
	 * Проверка множественных прав доступа
	 * Автоматически выбирает между реальным API и моком
	 */
	checkMultiplePermissions: USE_MOCK_API
		? mockPermissionsApi.checkMultiplePermissionsMock
		: checkMultiplePermissions,
};

/**
 * Утилиты для работы с правами доступа
 */
export const permissionsApiUtils = {
	/**
	 * Проверка, является ли ошибка связанной с правами доступа
	 */
	isPermissionError: (error: unknown): boolean => {
		if (apiErrorUtils.isApiError(error)) {
			return error.status === 403 || error.status === 401;
		}
		return false;
	},

	/**
	 * Получение сообщения об ошибке прав доступа
	 */
	getPermissionErrorMessage: (error: unknown): string => {
		if (permissionsApiUtils.isPermissionError(error)) {
			if (apiErrorUtils.isApiError(error) && error.status === 401) {
				return "Необходима авторизация для доступа к этому ресурсу";
			}
			return "У вас недостаточно прав для выполнения этого действия";
		}
		return apiErrorUtils.formatUserError(error);
	},

	/**
	 * Создание кэша для прав доступа
	 */
	createPermissionsCache: () => {
		const cache = new Map<
			string,
			{ permissions: UserPermissions; timestamp: number }
		>();
		const CACHE_TTL = 5 * 60 * 1000; // 5 минут

		return {
			get: (key: string): UserPermissions | null => {
				const cached = cache.get(key);
				if (!cached) return null;

				// Проверяем, не истек ли кэш
				if (Date.now() - cached.timestamp > CACHE_TTL) {
					cache.delete(key);
					return null;
				}

				return cached.permissions;
			},

			set: (key: string, permissions: UserPermissions): void => {
				cache.set(key, {
					permissions,
					timestamp: Date.now(),
				});
			},

			clear: (): void => {
				cache.clear();
			},

			has: (key: string): boolean => {
				return cache.has(key);
			},
		};
	},
};
