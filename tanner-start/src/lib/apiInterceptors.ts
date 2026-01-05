import { useAuthStore } from "@/stores/authStore";
import type { AfterResponseHook, BeforeErrorHook, BeforeRequestHook } from "ky";

/**
 * Interceptor для добавления токена аутентификации
 */
export const authInterceptor: BeforeRequestHook = (request) => {
	// Получаем токен из localStorage
	const getAuthToken = (): string | null => {
		try {
			const token = localStorage.getItem("auth-storage");
			if (!token) return null;

			const authData = JSON.parse(token);
			return authData.state?.user?.accessToken || null;
		} catch (error) {
			console.warn("Failed to parse auth token:", error);
			return null;
		}
	};

	const token = getAuthToken();
	if (token) {
		request.headers.set("Authorization", `Bearer ${token}`);
	}

	// Добавляем Content-Type для JSON запросов
	if (!request.headers.has("Content-Type") && request.body) {
		request.headers.set("Content-Type", "application/json");
	}

	// Добавляем дополнительные заголовки
	request.headers.set("X-Requested-With", "XMLHttpRequest");

	// Добавляем timestamp для предотвращения кеширования
	if (request.method === "GET") {
		const url = new URL(request.url);
		url.searchParams.set("_t", Date.now().toString());
		return new Request(url.toString(), request);
	}

	return request;
};

/**
 * Interceptor для логирования запросов (только в development)
 */
export const loggingInterceptor: BeforeRequestHook = (request) => {
	if (import.meta.env.DEV) {
		console.group(`🌐 API Request: ${request.method} ${request.url}`);
		console.log("Headers:", Object.fromEntries(request.headers.entries()));
		if (request.body) {
			console.log("Body:", request.body);
		}
		console.groupEnd();
	}
	return request;
};

/**
 * Interceptor для обработки ошибок
 */
export const errorInterceptor: BeforeErrorHook = async (error) => {
	const { request, response } = error;

	if (import.meta.env.DEV) {
		console.group(`❌ API Error: ${request.method} ${request.url}`);
		console.error("Status:", response.status);
		console.error("Error:", error.message);
		console.groupEnd();
	}

	// Пытаемся получить детали ошибки из ответа
	if (response && response.body) {
		try {
			const errorData = await response.json();
			error.message = errorData.message || error.message;
			(error as any).data = errorData;
		} catch (parseError) {
			// Игнорируем ошибки парсинга JSON
			console.warn("Failed to parse error response:", parseError);
		}
	}

	return error;
};

/**
 * Interceptor для обработки ответов
 */
export const responseInterceptor: AfterResponseHook = async (
	request,
	options,
	response,
) => {
	if (import.meta.env.DEV) {
		console.group(`✅ API Response: ${request.method} ${request.url}`);
		console.log("Status:", response.status);
		console.log("Headers:", Object.fromEntries(response.headers.entries()));
		console.groupEnd();
	}

	// Обработка 401 ошибки - пользователь не авторизован
	if (response.status === 401) {
		console.warn("Unauthorized access, clearing auth state");

		// Очищаем токен из localStorage
		localStorage.removeItem("auth-storage");

		// Очищаем состояние аутентификации в store
		try {
			const { logout } = useAuthStore.getState();
			logout();
		} catch (error) {
			console.warn("Failed to clear auth store:", error);
		}

		// Перенаправляем на страницу входа (только в браузере)
		if (
			typeof window !== "undefined" &&
			window.location.pathname !== "/login"
		) {
			const currentPath = window.location.pathname + window.location.search;
			window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
		}
	}

	// Обработка 403 ошибки - недостаточно прав
	if (response.status === 403) {
		console.warn("Access forbidden");

		// Можно показать уведомление или перенаправить на страницу с ошибкой
		if (typeof window !== "undefined") {
			// В реальном приложении здесь может быть toast уведомление
			console.warn("Access denied: insufficient permissions");
		}
	}

	// Обработка 429 ошибки - слишком много запросов
	if (response.status === 429) {
		console.warn("Rate limit exceeded");

		// Можно добавить логику для показа уведомления пользователю
		if (typeof window !== "undefined") {
			console.warn("Too many requests, please try again later");
		}
	}

	return response;
};

/**
 * Interceptor для retry логики
 */
export const retryInterceptor = {
	limit: 3,
	methods: ["get", "put", "head", "delete", "options", "trace"] as const,
	statusCodes: [408, 413, 429, 500, 502, 503, 504] as const,
	backoffLimit: 3000,
	delay: (attemptCount: number) => 0.3 * 2 ** (attemptCount - 1) * 1000, // Exponential backoff
};

/**
 * Конфигурация timeout для разных типов запросов
 */
export const timeoutConfig = {
	default: 30000, // 30 секунд
	upload: 120000, // 2 минуты для загрузки файлов
	download: 300000, // 5 минут для скачивания файлов
	auth: 15000, // 15 секунд для аутентификации
};

/**
 * Interceptor для TanStack Query с Zustand
 * Использует Zustand store напрямую для получения токена
 */
export const tanstackAuthInterceptor: BeforeRequestHook = (request) => {
	// Получаем токен напрямую из Zustand store
	const token = useAuthStore.getState().user?.accessToken;

	if (token) {
		request.headers.set("Authorization", `Bearer ${token}`);
	}

	// Добавляем Content-Type для JSON запросов
	if (!request.headers.has("Content-Type") && request.body) {
		request.headers.set("Content-Type", "application/json");
	}

	// Добавляем дополнительные заголовки
	request.headers.set("X-Requested-With", "XMLHttpRequest");

	// Добавляем timestamp для предотвращения кеширования
	if (request.method === "GET") {
		const url = new URL(request.url);
		url.searchParams.set("_t", Date.now().toString());
		return new Request(url.toString(), request);
	}

	return request;
};

/**
 * Утилиты для работы с interceptors
 */
export const interceptorUtils = {
	/**
	 * Создание кастомного interceptor для конкретного API
	 */
	createCustomAuthInterceptor: (
		getToken: () => string | null,
	): BeforeRequestHook => {
		return (request) => {
			const token = getToken();
			if (token) {
				request.headers.set("Authorization", `Bearer ${token}`);
			}
			return request;
		};
	},

	/**
	 * Создание interceptor для добавления кастомных заголовков
	 */
	createHeadersInterceptor: (
		headers: Record<string, string>,
	): BeforeRequestHook => {
		return (request) => {
			Object.entries(headers).forEach(([key, value]) => {
				request.headers.set(key, value);
			});
			return request;
		};
	},

	/**
	 * Создание interceptor для трансформации запросов
	 */
	createTransformInterceptor: (
		transform: (request: Request) => Request,
	): BeforeRequestHook => {
		return transform;
	},
};
