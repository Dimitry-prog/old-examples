import { createApi } from "@reduxjs/toolkit/query/react";
import { createRPCBaseQuery } from "./rpc-base-query";

/**
 * Пример API для работы с единым POST endpoint
 *
 * Все запросы идут на один URL методом POST
 * В теле запроса передается:
 * - method: название метода
 * - params: параметры
 */

// Типы данных
export interface User {
	id: number;
	name: string;
	email: string;
}

export interface Product {
	id: number;
	title: string;
	price: number;
}

// Создаем API с RPC baseQuery
export const rpcApi = createApi({
	reducerPath: "rpcApi",
	baseQuery: createRPCBaseQuery(
		"/api",
		"/rpc", // единый endpoint
	),
	tagTypes: ["User", "Product"],
	endpoints: (build) => ({
		// Получение списка пользователей
		getUsers: build.query<User[], void>({
			query: () => ({
				method: "users.list",
				params: {},
			}),
			providesTags: ["User"],
		}),

		// Получение пользователя по ID
		getUserById: build.query<User, number>({
			query: (id) => ({
				method: "users.get",
				params: { id },
			}),
			providesTags: (_result, _error, id) => [{ type: "User", id }],
		}),

		// Создание пользователя
		createUser: build.mutation<User, Omit<User, "id">>({
			query: (userData) => ({
				method: "users.create",
				params: userData,
			}),
			invalidatesTags: ["User"],
		}),

		// Обновление пользователя
		updateUser: build.mutation<User, User>({
			query: (userData) => ({
				method: "users.update",
				params: userData,
			}),
			invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
		}),

		// Удаление пользователя
		deleteUser: build.mutation<void, number>({
			query: (id) => ({
				method: "users.delete",
				params: { id },
			}),
			invalidatesTags: (_result, _error, id) => [{ type: "User", id }],
		}),

		// Получение списка продуктов с фильтрами
		getProducts: build.query<
			Product[],
			{ category?: string; minPrice?: number }
		>({
			query: (filters) => ({
				method: "products.list",
				params: filters,
			}),
			providesTags: ["Product"],
		}),

		// Пример сложного запроса с множественными параметрами
		searchUsers: build.query<
			User[],
			{ query: string; limit?: number; offset?: number }
		>({
			query: ({ query, limit = 10, offset = 0 }) => ({
				method: "users.search",
				params: {
					query,
					limit,
					offset,
				},
			}),
		}),
	}),
});

// Экспортируем хуки
export const {
	useGetUsersQuery,
	useGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useGetProductsQuery,
	useSearchUsersQuery,
} = rpcApi;
