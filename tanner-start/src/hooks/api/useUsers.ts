import { api } from "@/lib/api";
import type { UsersListParams, UsersListResponse } from "@/types/users";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

/**
 * Функция для загрузки данных пользователей из API
 */
async function fetchUsers(params: UsersListParams): Promise<UsersListResponse> {
	const searchParams = new URLSearchParams();
	searchParams.set("page", params.page.toString());
	searchParams.set("pageSize", params.pageSize.toString());

	if (params.sortBy) {
		searchParams.set("sortBy", params.sortBy);
		searchParams.set("sortOrder", params.sortOrder || "asc");
	}

	if (params.filters) {
		Object.entries(params.filters).forEach(([key, value]) => {
			if (value) {
				searchParams.set(key, value);
			}
		});
	}

	return api.get<UsersListResponse>(`users?${searchParams.toString()}`);
}

/**
 * Хук для загрузки данных пользователей с использованием TanStack Query
 */
export function useUsers(
	params: UsersListParams,
): UseQueryResult<UsersListResponse, Error> {
	return useQuery({
		queryKey: ["users", params],
		queryFn: () => fetchUsers(params),
		staleTime: 5 * 60 * 1000, // 5 минут
		gcTime: 10 * 60 * 1000, // 10 минут
	});
}
