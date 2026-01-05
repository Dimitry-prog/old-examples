/**
 * Конфигурация API endpoints
 * Централизованное управление всеми API маршрутами
 */

export const API_ENDPOINTS = {
	// Аутентификация
	AUTH: {
		LOGIN: "auth/login",
		LOGOUT: "auth/logout",
		REFRESH: "auth/refresh",
		PROFILE: "auth/profile",
		REGISTER: "auth/register",
		FORGOT_PASSWORD: "auth/forgot-password",
		RESET_PASSWORD: "auth/reset-password",
		VERIFY_EMAIL: "auth/verify-email",
	},

	// Пользователи
	USERS: {
		LIST: "users",
		DETAIL: (id: string) => `users/${id}`,
		CREATE: "users",
		UPDATE: (id: string) => `users/${id}`,
		DELETE: (id: string) => `users/${id}`,
		AVATAR: (id: string) => `users/${id}/avatar`,
	},

	// Файлы
	FILES: {
		UPLOAD: "files/upload",
		DOWNLOAD: (id: string) => `files/${id}/download`,
		DELETE: (id: string) => `files/${id}`,
		LIST: "files",
	},

	// Настройки
	SETTINGS: {
		GET: "settings",
		UPDATE: "settings",
		RESET: "settings/reset",
	},

	// Уведомления
	NOTIFICATIONS: {
		LIST: "notifications",
		MARK_READ: (id: string) => `notifications/${id}/read`,
		MARK_ALL_READ: "notifications/read-all",
		DELETE: (id: string) => `notifications/${id}`,
	},

	// Права доступа
	PERMISSIONS: {
		GET_USER_PERMISSIONS: "permissions",
		CHECK_PERMISSION: "permissions/check",
		CHECK_MULTIPLE: "permissions/check-multiple",
	},
} as const;

/**
 * Типы для API endpoints
 */
export type ApiEndpoints = typeof API_ENDPOINTS;

/**
 * Утилиты для работы с endpoints
 */
export const endpointUtils = {
	/**
	 * Построение URL с параметрами
	 */
	buildUrl: (
		endpoint: string,
		params?: Record<string, string | number>,
	): string => {
		if (!params) return endpoint;

		const url = new URL(endpoint, "http://localhost"); // Базовый URL для парсинга
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.set(key, value.toString());
		});

		return endpoint + url.search;
	},

	/**
	 * Замена параметров в URL
	 */
	replaceParams: (
		endpoint: string,
		params: Record<string, string | number>,
	): string => {
		let result = endpoint;
		Object.entries(params).forEach(([key, value]) => {
			result = result.replace(`:${key}`, value.toString());
		});
		return result;
	},

	/**
	 * Проверка, является ли endpoint функцией
	 */
	isFunction: (endpoint: any): endpoint is Function => {
		return typeof endpoint === "function";
	},
};

/**
 * Типизированные методы для работы с конкретными API
 */
export const typedEndpoints = {
	auth: {
		login: { method: "POST", url: API_ENDPOINTS.AUTH.LOGIN },
		logout: { method: "POST", url: API_ENDPOINTS.AUTH.LOGOUT },
		refresh: { method: "POST", url: API_ENDPOINTS.AUTH.REFRESH },
		profile: { method: "GET", url: API_ENDPOINTS.AUTH.PROFILE },
		register: { method: "POST", url: API_ENDPOINTS.AUTH.REGISTER },
	},

	users: {
		list: {
			method: "GET",
			url: API_ENDPOINTS.USERS.LIST,
			transform: (data: any) => ({
				users: data.users || [],
				total: data.total || 0,
				page: data.page || 1,
				limit: data.limit || 10,
			}),
		},
		get: {
			method: "GET",
			url: (params: { id: string }) => API_ENDPOINTS.USERS.DETAIL(params.id),
		},
		create: { method: "POST", url: API_ENDPOINTS.USERS.CREATE },
		update: {
			method: "PATCH",
			url: (params: { id: string }) => API_ENDPOINTS.USERS.UPDATE(params.id),
		},
		delete: {
			method: "DELETE",
			url: (params: { id: string }) => API_ENDPOINTS.USERS.DELETE(params.id),
		},
	},

	files: {
		upload: { method: "POST", url: API_ENDPOINTS.FILES.UPLOAD },
		download: {
			method: "GET",
			url: (params: { id: string }) => API_ENDPOINTS.FILES.DOWNLOAD(params.id),
		},
		list: { method: "GET", url: API_ENDPOINTS.FILES.LIST },
		delete: {
			method: "DELETE",
			url: (params: { id: string }) => API_ENDPOINTS.FILES.DELETE(params.id),
		},
	},

	permissions: {
		getUserPermissions: {
			method: "GET",
			url: API_ENDPOINTS.PERMISSIONS.GET_USER_PERMISSIONS,
			transform: (data: any) => data.permissions || [],
		},
		checkPermission: {
			method: "POST",
			url: API_ENDPOINTS.PERMISSIONS.CHECK_PERMISSION,
		},
		checkMultiple: {
			method: "POST",
			url: API_ENDPOINTS.PERMISSIONS.CHECK_MULTIPLE,
		},
	},
} as const;
