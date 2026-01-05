import {
	MutationCache,
	QueryCache,
	QueryClient,
	type DefaultOptions,
} from "@tanstack/react-query";

/**
 * Глобальная обработка ошибок для непредвиденных случаев
 */
function handleGlobalQueryError(error: unknown) {
	// Обрабатываем только непредвиденные ошибки
	// Ожидаемые ошибки (401, 403, 404) обрабатываются в компонентах

	if (error && typeof error === "object" && "status" in error) {
		const status = (error as any).status;

		// Серверные ошибки (500+)
		if (typeof status === "number" && status >= 500) {
			console.error("🚨 Server Error:", error);
			// Здесь можно показать toast
			// toast.error(`Сервер временно недоступен (${status})`);
			return;
		}

		// Сетевые ошибки
		if (status === "FETCH_ERROR" || status === "NetworkError") {
			console.error("🚨 Network Error:", error);
			// toast.error('Проверьте подключение к интернету');
			return;
		}
	}

	// Неизвестные ошибки
	console.error("🚨 Unknown Error:", error);
}

/**
 * Конфигурация по умолчанию для TanStack Query
 */
const queryConfig: DefaultOptions = {
	queries: {
		// Время жизни кеша в миллисекундах (5 минут)
		staleTime: 1000 * 60 * 5,

		// Время хранения неактивных данных в кеше (10 минут)
		gcTime: 1000 * 60 * 10,

		// Повторные запросы при ошибках
		retry: (failureCount, error) => {
			// Не повторять для 4xx ошибок
			if (error instanceof Error && "status" in error) {
				const status = (error as any).status;
				if (status >= 400 && status < 500) {
					return false;
				}
			}

			// Максимум 3 попытки для других ошибок
			return failureCount < 3;
		},

		// Интервал между повторными запросами (экспоненциальная задержка)
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

		// Автоматическое обновление при фокусе окна
		refetchOnWindowFocus: true,

		// Автоматическое обновление при восстановлении соединения
		refetchOnReconnect: true,

		// Не обновлять при монтировании, если данные свежие
		refetchOnMount: true,
	},
	mutations: {
		// Повторные попытки для мутаций
		retry: (failureCount, error) => {
			// Не повторять для клиентских ошибок
			if (error instanceof Error && "status" in error) {
				const status = (error as any).status;
				if (status >= 400 && status < 500) {
					return false;
				}
			}

			// Максимум 1 попытка для мутаций
			return failureCount < 1;
		},
	},
};

/**
 * Создание экземпляра QueryClient с оптимальными настройками
 */
export const queryClient = new QueryClient({
	defaultOptions: queryConfig,
	// Глобальная обработка ошибок через QueryCache и MutationCache
	queryCache: new QueryCache({
		onError: (error) => {
			handleGlobalQueryError(error);
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			handleGlobalQueryError(error);
		},
	}),
});

/**
 * Ключи для запросов - централизованное управление
 */
export const queryKeys = {
	// Пользователи
	users: {
		all: ["users"] as const,
		lists: () => [...queryKeys.users.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.users.lists(), { filters }] as const,
		details: () => [...queryKeys.users.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.users.details(), id] as const,
		profile: () => [...queryKeys.users.all, "profile"] as const,
	},

	// Посты
	posts: {
		all: ["posts"] as const,
		lists: () => [...queryKeys.posts.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.posts.lists(), { filters }] as const,
		details: () => [...queryKeys.posts.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.posts.details(), id] as const,
	},

	// Комментарии
	comments: {
		all: ["comments"] as const,
		lists: () => [...queryKeys.comments.all, "list"] as const,
		list: (postId: string) =>
			[...queryKeys.comments.lists(), { postId }] as const,
		details: () => [...queryKeys.comments.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.comments.details(), id] as const,
	},

	// Настройки
	settings: {
		all: ["settings"] as const,
		user: () => [...queryKeys.settings.all, "user"] as const,
		app: () => [...queryKeys.settings.all, "app"] as const,
	},

	// Статистика
	stats: {
		all: ["stats"] as const,
		dashboard: () => [...queryKeys.stats.all, "dashboard"] as const,
		analytics: (period: string) =>
			[...queryKeys.stats.all, "analytics", { period }] as const,
	},
} as const;

/**
 * Утилиты для работы с кешем
 */
export const queryUtils = {
	/**
	 * Инвалидация всех запросов пользователей
	 */
	invalidateUsers: () => {
		return queryClient.invalidateQueries({
			queryKey: queryKeys.users.all,
		});
	},

	/**
	 * Инвалидация конкретного пользователя
	 */
	invalidateUser: (id: string) => {
		return queryClient.invalidateQueries({
			queryKey: queryKeys.users.detail(id),
		});
	},

	/**
	 * Инвалидация профиля пользователя
	 */
	invalidateProfile: () => {
		return queryClient.invalidateQueries({
			queryKey: queryKeys.users.profile(),
		});
	},

	/**
	 * Инвалидация всех постов
	 */
	invalidatePosts: () => {
		return queryClient.invalidateQueries({
			queryKey: queryKeys.posts.all,
		});
	},

	/**
	 * Инвалидация конкретного поста
	 */
	invalidatePost: (id: string) => {
		return queryClient.invalidateQueries({
			queryKey: queryKeys.posts.detail(id),
		});
	},

	/**
	 * Инвалидация комментариев поста
	 */
	invalidatePostComments: (postId: string) => {
		return queryClient.invalidateQueries({
			queryKey: queryKeys.comments.list(postId),
		});
	},

	/**
	 * Предварительная загрузка данных
	 */
	prefetchUser: (id: string) => {
		return queryClient.prefetchQuery({
			queryKey: queryKeys.users.detail(id),
			queryFn: () => {
				// Здесь будет вызов API
				return Promise.resolve(null);
			},
		});
	},

	/**
	 * Установка данных в кеш
	 */
	setUserData: (id: string, data: unknown) => {
		queryClient.setQueryData(queryKeys.users.detail(id), data);
	},

	/**
	 * Получение данных из кеша
	 */
	getUserData: (id: string) => {
		return queryClient.getQueryData(queryKeys.users.detail(id));
	},

	/**
	 * Удаление данных из кеша
	 */
	removeUserData: (id: string) => {
		queryClient.removeQueries({
			queryKey: queryKeys.users.detail(id),
		});
	},

	/**
	 * Очистка всего кеша
	 */
	clearCache: () => {
		queryClient.clear();
	},

	/**
	 * Отмена всех запросов
	 */
	cancelQueries: () => {
		return queryClient.cancelQueries();
	},
};

/**
 * Настройки для разработки
 */
export const devQueryConfig: DefaultOptions = {
	...queryConfig,
	queries: {
		...queryConfig.queries,
		// Более частое обновление в разработке
		staleTime: 1000 * 30, // 30 секунд
		gcTime: 1000 * 60 * 2, // 2 минуты
		// Показывать больше информации об ошибках
		retry: false,
	},
};

/**
 * QueryClient для разработки
 */
export const devQueryClient = new QueryClient({
	defaultOptions: devQueryConfig,
});

/**
 * Получение правильного QueryClient в зависимости от окружения
 */
export const getQueryClient = () => {
	return import.meta.env["DEV"] ? devQueryClient : queryClient;
};

/**
 * Типы для TypeScript
 */
export type QueryKey = typeof queryKeys;
export type QueryUtils = typeof queryUtils;
