import { baseApi } from "./base-api";

// Типы данных
export interface User {
	id: number;
	name: string;
	email: string;
}

export interface CreateUserRequest {
	name: string;
	email: string;
}

// Расширяем базовый API эндпоинтами для пользователей
export const usersApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		// Получение списка пользователей
		getUsers: build.query<User[], void>({
			query: () => "/users",
		}),

		// Получение пользователя по ID
		getUserById: build.query<User, number>({
			query: (id) => `/users/${id}`,
		}),

		// Создание пользователя
		createUser: build.mutation<User, CreateUserRequest>({
			query: (body) => ({
				url: "/users",
				method: "POST",
				body,
			}),
		}),

		// Удаление пользователя
		deleteUser: build.mutation<void, number>({
			query: (id) => ({
				url: `/users/${id}`,
				method: "DELETE",
			}),
		}),
	}),
});

// Экспортируем хуки для использования в компонентах
export const {
	useGetUsersQuery,
	useGetUserByIdQuery,
	useCreateUserMutation,
	useDeleteUserMutation,
} = usersApi;
