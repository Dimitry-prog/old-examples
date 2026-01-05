import { useCacheManager, useOfflineManager } from "@/hooks/useCacheManager";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createContext, useContext, useEffect, type ReactNode } from "react";

interface QueryContextValue {
	queryClient: QueryClient;
	cacheManager: ReturnType<typeof useCacheManager>;
	offlineManager: ReturnType<typeof useOfflineManager>;
}

const QueryContext = createContext<QueryContextValue | null>(null);

interface QueryProviderProps {
	children: ReactNode;
	client?: QueryClient;
	enableDevtools?: boolean;
	enablePersistence?: boolean;
}

/**
 * Провайдер для TanStack Query с дополнительными утилитами
 */
export function QueryProvider({
	children,
	client = queryClient,
	enableDevtools = process.env.NODE_ENV === "development",
	enablePersistence = true,
}: QueryProviderProps) {
	return (
		<QueryClientProvider client={client}>
			<QueryContextInner
				enableDevtools={enableDevtools}
				enablePersistence={enablePersistence}
			>
				{children}
			</QueryContextInner>
		</QueryClientProvider>
	);
}

function QueryContextInner({
	children,
	enableDevtools,
	enablePersistence,
}: {
	children: ReactNode;
	enableDevtools: boolean;
	enablePersistence: boolean;
}) {
	const cacheManager = useCacheManager();
	const offlineManager = useOfflineManager();

	// Настройка персистентности кеша
	useEffect(() => {
		if (enablePersistence) {
			// Загружаем кеш при инициализации
			const stored = localStorage.getItem("tanstack-query-cache");
			if (stored) {
				try {
					const persistData = JSON.parse(stored) as Array<{
						queryKey: unknown;
						data: unknown;
					}>;
					persistData.forEach((item) => {
						if (item.queryKey && item.data) {
							queryClient.setQueryData(item.queryKey, item.data);
						}
					});
				} catch (error) {
					console.error("Failed to restore cache:", error);
				}
			}

			// Сохраняем кеш при изменениях
			const unsubscribe = queryClient.getQueryCache().subscribe(() => {
				const timeoutId = setTimeout(() => {
					cacheManager.exportCache();
				}, 1000);

				return () => clearTimeout(timeoutId);
			});

			return unsubscribe;
		}
	}, [enablePersistence, cacheManager]);

	// Автоматическое восстановление запросов при восстановлении соединения
	useEffect(() => {
		if (offlineManager.isOnline && offlineManager.offlineQueriesCount > 0) {
			offlineManager.retryOfflineQueries();
		}
	}, [
		offlineManager.isOnline,
		offlineManager.offlineQueriesCount,
		offlineManager.retryOfflineQueries,
	]);

	const contextValue: QueryContextValue = {
		queryClient,
		cacheManager,
		offlineManager,
	};

	return (
		<QueryContext.Provider value={contextValue}>
			{children}
			{enableDevtools && (
				<ReactQueryDevtools
					initialIsOpen={false}
					buttonPosition="bottom-right"
				/>
			)}
		</QueryContext.Provider>
	);
}

/**
 * Хук для использования контекста Query
 */
export function useQueryContext() {
	const context = useContext(QueryContext);

	if (!context) {
		throw new Error("useQueryContext must be used within QueryProvider");
	}

	return context;
}

/**
 * Хук для глобального управления кешем
 */
export function useGlobalCache() {
	const { cacheManager } = useQueryContext();
	return cacheManager;
}

/**
 * Хук для управления оффлайн состоянием
 */
export function useGlobalOffline() {
	const { offlineManager } = useQueryContext();
	return offlineManager;
}

/**
 * Хук для получения статистики Query
 */
export function useQueryStats() {
	const { cacheManager, offlineManager } = useQueryContext();

	return {
		cache: cacheManager.getStats(),
		offline: {
			isOnline: offlineManager.isOnline,
			isOffline: offlineManager.isOffline,
			offlineQueriesCount: offlineManager.offlineQueriesCount,
		},
	};
}
