import type { QueryFilters, QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

/**
 * Хук для управления кешем TanStack Query
 */
export function useCacheManager(): {
	cacheSize: number;
	cacheSizeFormatted: string;
	queriesCount: number;
	clearAll: () => void;
	clearByFilter: (filters: QueryFilters) => void;
	clearStale: () => number;
	invalidateAll: () => Promise<void>;
	invalidateByFilter: (filters: QueryFilters) => Promise<void>;
	getAllQueryKeys: () => QueryKey[];
	getAllQueriesData: () => Array<{
		queryKey: QueryKey;
		data: unknown;
		status: string;
		isStale: boolean;
		lastUpdated: number;
	}>;
	exportCache: () => string;
	importCache: (jsonData: string) => boolean;
	getStats: () => {
		queriesCount: number;
		cacheSize: number;
		cacheSizeFormatted: string;
	};
} {
	const queryClient = useQueryClient();
	const [cacheSize, setCacheSize] = useState(0);
	const [queriesCount, setQueriesCount] = useState(0);

	// Обновление статистики кеша
	const updateCacheStats = useCallback(() => {
		const cache = queryClient.getQueryCache();
		const queries = cache.getAll();

		setQueriesCount(queries.length);

		// Приблизительный размер кеша (в байтах)
		const size = queries.reduce((total, query) => {
			const data = query.state.data;
			if (data) {
				try {
					return total + JSON.stringify(data).length * 2; // UTF-16
				} catch {
					return total;
				}
			}
			return total;
		}, 0);

		setCacheSize(size);
	}, [queryClient]);

	// Обновляем статистику при изменениях
	useEffect(() => {
		updateCacheStats();

		const unsubscribe = queryClient.getQueryCache().subscribe(() => {
			updateCacheStats();
		});

		return unsubscribe;
	}, [queryClient, updateCacheStats]);

	// Утилиты для управления кешем
	const utils = {
		// Очистка всего кеша
		clearAll: useCallback(() => {
			queryClient.clear();
		}, [queryClient]),

		// Очистка кеша по фильтру
		clearByFilter: useCallback(
			(filters: QueryFilters) => {
				queryClient.removeQueries(filters);
			},
			[queryClient],
		),

		// Очистка устаревших данных
		clearStale: useCallback(() => {
			const cache = queryClient.getQueryCache();
			const staleQueries = cache.getAll().filter((query) => query.isStale());

			staleQueries.forEach((query) => {
				queryClient.removeQueries({ queryKey: query.queryKey });
			});

			return staleQueries.length;
		}, [queryClient]),

		// Инвалидация всех запросов
		invalidateAll: useCallback(() => {
			return queryClient.invalidateQueries();
		}, [queryClient]),

		// Инвалидация по фильтру
		invalidateByFilter: useCallback(
			(filters: QueryFilters) => {
				return queryClient.invalidateQueries(filters);
			},
			[queryClient],
		),

		// Получение всех ключей запросов
		getAllQueryKeys: useCallback((): QueryKey[] => {
			const cache = queryClient.getQueryCache();
			return cache.getAll().map((query) => query.queryKey);
		}, [queryClient]),

		// Получение данных всех запросов
		getAllQueriesData: useCallback(() => {
			const cache = queryClient.getQueryCache();
			return cache.getAll().map((query) => ({
				queryKey: query.queryKey,
				data: query.state.data,
				status: query.state.status,
				isStale: query.isStale(),
				lastUpdated: query.state.dataUpdatedAt,
			}));
		}, [queryClient]),

		// Экспорт кеша в JSON
		exportCache: useCallback(() => {
			const cache = queryClient.getQueryCache();
			const queries = cache.getAll();

			const exportData = queries.map((query) => ({
				queryKey: query.queryKey,
				data: query.state.data,
				dataUpdatedAt: query.state.dataUpdatedAt,
				status: query.state.status,
			}));

			return JSON.stringify(exportData, null, 2);
		}, [queryClient]),

		// Импорт кеша из JSON
		importCache: useCallback(
			(jsonData: string) => {
				try {
					const importData = JSON.parse(jsonData) as Array<{
						queryKey: QueryKey;
						data: unknown;
					}>;

					importData.forEach((item) => {
						if (item.queryKey && item.data) {
							queryClient.setQueryData(item.queryKey, item.data);
						}
					});

					return true;
				} catch (error) {
					console.error("Failed to import cache:", error);
					return false;
				}
			},
			[queryClient],
		),

		// Получение статистики кеша
		getStats: useCallback(
			() => ({
				queriesCount,
				cacheSize,
				cacheSizeFormatted: formatBytes(cacheSize),
			}),
			[queriesCount, cacheSize],
		),
	};

	return {
		cacheSize,
		cacheSizeFormatted: formatBytes(cacheSize),
		queriesCount,
		...utils,
	};
}

/**
 * Хук для работы с оффлайн состоянием
 */
export function useOfflineManager() {
	const queryClient = useQueryClient();
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [offlineQueries, setOfflineQueries] = useState<QueryKey[]>([]);

	// Отслеживание состояния сети
	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			// Возобновляем приостановленные запросы
			queryClient.resumePausedMutations();
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [queryClient]);

	// Отслеживание неудачных запросов в оффлайне
	useEffect(() => {
		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (event?.type === "updated") {
				const query = queryClient
					.getQueryCache()
					.find({ queryKey: event.query.queryKey });
				if (query && query.state.status === "error") {
					const error = query.state.error as Error;
					if (error?.name === "NetworkError" || !isOnline) {
						setOfflineQueries((prev) => {
							const queryKey = query.queryKey;
							if (
								!prev.some(
									(key) => JSON.stringify(key) === JSON.stringify(queryKey),
								)
							) {
								return [...prev, queryKey];
							}
							return prev;
						});
					}
				}
			}
		});

		return unsubscribe;
	}, [queryClient, isOnline]);

	// Повторить неудачные запросы
	const retryOfflineQueries = useCallback(() => {
		offlineQueries.forEach((queryKey) => {
			queryClient.invalidateQueries({ queryKey });
		});
		setOfflineQueries([]);
	}, [queryClient, offlineQueries]);

	// Очистить список оффлайн запросов
	const clearOfflineQueries = useCallback(() => {
		setOfflineQueries([]);
	}, []);

	// Настроить поведение в оффлайне
	const configureOfflineBehavior = useCallback(
		(config: {
			retryOnReconnect?: boolean;
			pauseMutationsOffline?: boolean;
		}) => {
			if (config.retryOnReconnect && isOnline && offlineQueries.length > 0) {
				retryOfflineQueries();
			}
		},
		[isOnline, offlineQueries.length, retryOfflineQueries],
	);

	const utils = {
		retryOfflineQueries,
		clearOfflineQueries,
		configureOfflineBehavior,
	};

	return {
		isOnline,
		isOffline: !isOnline,
		offlineQueries,
		offlineQueriesCount: offlineQueries.length,
		...utils,
	};
}

/**
 * Хук для персистентного кеша
 */
export function usePersistentCache(storageKey = "tanstack-query-cache") {
	const queryClient = useQueryClient();

	// Сохранение кеша в localStorage
	const saveToStorage = useCallback(() => {
		try {
			const cache = queryClient.getQueryCache();
			const queries = cache.getAll();

			const persistData = queries
				.filter((query) => query.state.status === "success" && query.state.data)
				.map((query) => ({
					queryKey: query.queryKey,
					data: query.state.data,
					dataUpdatedAt: query.state.dataUpdatedAt,
				}));

			localStorage.setItem(storageKey, JSON.stringify(persistData));
			return true;
		} catch (error) {
			console.error("Failed to save cache to storage:", error);
			return false;
		}
	}, [queryClient, storageKey]);

	// Загрузка кеша из localStorage
	const loadFromStorage = useCallback(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (!stored) return false;

			const persistData = JSON.parse(stored) as Array<{
				queryKey: QueryKey;
				data: unknown;
				dataUpdatedAt: number;
			}>;
			const now = Date.now();

			persistData.forEach((item) => {
				// Проверяем, не устарели ли данные (например, старше 1 часа)
				const isStale = now - item.dataUpdatedAt > 1000 * 60 * 60;

				if (!isStale && item.queryKey && item.data) {
					queryClient.setQueryData(item.queryKey, item.data);
				}
			});

			return true;
		} catch (error) {
			console.error("Failed to load cache from storage:", error);
			return false;
		}
	}, [queryClient, storageKey]);

	// Очистка сохраненного кеша
	const clearStorage = useCallback(() => {
		try {
			localStorage.removeItem(storageKey);
			return true;
		} catch (error) {
			console.error("Failed to clear cache storage:", error);
			return false;
		}
	}, [storageKey]);

	// Автоматическое сохранение при изменениях кеша
	useEffect(() => {
		const unsubscribe = queryClient.getQueryCache().subscribe(() => {
			// Дебаунс для избежания частых сохранений
			const timeoutId = setTimeout(() => {
				saveToStorage();
			}, 1000);

			return () => clearTimeout(timeoutId);
		});

		return unsubscribe;
	}, [queryClient, saveToStorage]);

	// Загрузка кеша при инициализации
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	return {
		saveToStorage,
		loadFromStorage,
		clearStorage,
	};
}

/**
 * Утилита для форматирования размера в байтах
 */
function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / k ** i).toFixed(dm)) + " " + sizes[i];
}
