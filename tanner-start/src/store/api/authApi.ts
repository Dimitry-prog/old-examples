import type { AuthUser } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearUser, setUser } from "../slices/authSlice";

// ============================================================================
// Types
// ============================================================================

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: AuthUser;
	accessToken: string;
	refreshToken: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

// ============================================================================
// API
// ============================================================================

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/auth",
		// Добавляем токен к каждому запросу
		prepareHeaders: (headers, { getState }) => {
			const state = getState() as {
				auth?: { user?: { accessToken?: string } };
			};
			const token = state.auth?.user?.accessToken;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["Auth", "Profile"],
	endpoints: (build) => ({
		// ========================================================================
		// Login - Вход в систему
		// ========================================================================
		login: build.mutation<LoginResponse, LoginRequest>({
			// В реальном приложении раскомментируйте:
			// query: (credentials) => ({
			//   url: '/login',
			//   method: 'POST',
			//   body: credentials,
			// }),

			// Симуляция API для демонстрации
			async queryFn(credentials) {
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Симуляция ошибки
				if (credentials.email === "error@test.com") {
					return {
						error: {
							status: 401,
							data: { message: "Неверный email или пароль" },
						},
					};
				}

				const mockUser: AuthUser = {
					id: "1",
					email: credentials.email,
					name: "John Doe",
					avatar: "https://github.com/shadcn.png",
					role: "user",
					accessToken: "mock-access-token-" + Date.now(),
					refreshToken: "mock-refresh-token-" + Date.now(),
				};

				return {
					data: {
						user: mockUser,
						accessToken: mockUser.accessToken,
						refreshToken: mockUser.refreshToken,
					},
				};
			},
			invalidatesTags: ["Auth", "Profile"],
			// Автоматически обновляем Redux store при успешном логине
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					// Сохраняем пользователя в Redux store
					dispatch(setUser(data.user));
				} catch (error) {
					// Просто пробрасываем ошибку
					// Обработка в компоненте
					throw error;
				}
			},
		}),

		// ========================================================================
		// Logout - Выход из системы
		// ========================================================================
		logout: build.mutation<void, void>({
			// В реальном приложении раскомментируйте:
			// query: () => ({
			//   url: '/logout',
			//   method: 'POST',
			// }),

			// Симуляция API
			async queryFn() {
				await new Promise((resolve) => setTimeout(resolve, 500));
				return { data: undefined };
			},
			invalidatesTags: ["Auth", "Profile"],
			// Автоматически очищаем Redux store при logout
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					dispatch(clearUser());
				} catch (error) {
					// Даже при ошибке очищаем локальное состояние
					dispatch(clearUser());
					throw error;
				}
			},
		}),

		// ========================================================================
		// Refresh Token - Обновление токенов
		// ========================================================================
		refreshToken: build.mutation<RefreshTokenResponse, RefreshTokenRequest>({
			// В реальном приложении раскомментируйте:
			// query: (body) => ({
			//   url: '/refresh',
			//   method: 'POST',
			//   body,
			// }),

			// Симуляция API
			async queryFn() {
				await new Promise((resolve) => setTimeout(resolve, 500));

				return {
					data: {
						accessToken: "new-access-token-" + Date.now(),
						refreshToken: "new-refresh-token-" + Date.now(),
					},
				};
			},
			// Автоматически обновляем токены в Redux store
			async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
				try {
					const { data } = await queryFulfilled;
					const state = getState() as { auth?: { user?: AuthUser } };
					const currentUser = state.auth?.user;

					if (currentUser) {
						dispatch(
							setUser({
								...currentUser,
								accessToken: data.accessToken,
								refreshToken: data.refreshToken,
							}),
						);
					}
				} catch (error) {
					// При ошибке обновления токенов выходим из системы
					dispatch(clearUser());
					throw error;
				}
			},
		}),

		// ========================================================================
		// Get Profile - Получение профиля пользователя
		// ========================================================================
		getProfile: build.query<AuthUser, void>({
			// В реальном приложении раскомментируйте:
			// query: () => '/profile',

			// Симуляция API
			async queryFn() {
				await new Promise((resolve) => setTimeout(resolve, 800));

				const mockProfile: AuthUser = {
					id: "1",
					email: "user@example.com",
					name: "John Doe Updated",
					avatar: "https://github.com/shadcn.png",
					role: "user",
					accessToken: "current-access-token",
					refreshToken: "current-refresh-token",
				};

				return { data: mockProfile };
			},
			providesTags: ["Profile"],
		}),

		// ========================================================================
		// Update Profile - Обновление профиля
		// ========================================================================
		updateProfile: build.mutation<AuthUser, Partial<AuthUser>>({
			// В реальном приложении раскомментируйте:
			// query: (body) => ({
			//   url: '/profile',
			//   method: 'PATCH',
			//   body,
			// }),

			// Симуляция API
			async queryFn(updates) {
				await new Promise((resolve) => setTimeout(resolve, 600));

				const mockProfile: AuthUser = {
					id: "1",
					email: "user@example.com",
					name: updates.name || "John Doe",
					avatar: updates.avatar || "https://github.com/shadcn.png",
					role: "user",
					accessToken: "current-access-token",
					refreshToken: "current-refresh-token",
				};

				return { data: mockProfile };
			},
			invalidatesTags: ["Profile"],
			// Автоматически обновляем пользователя в Redux store
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(setUser(data));
				} catch (error) {
					throw error;
				}
			},
		}),

		// ========================================================================
		// Register - Регистрация нового пользователя
		// ========================================================================
		register: build.mutation<LoginResponse, LoginRequest & { name: string }>({
			// В реальном приложении раскомментируйте:
			// query: (body) => ({
			//   url: '/register',
			//   method: 'POST',
			//   body,
			// }),

			// Симуляция API
			async queryFn(data) {
				await new Promise((resolve) => setTimeout(resolve, 1200));

				// Симуляция ошибки - email уже существует
				if (data.email === "exists@test.com") {
					return {
						error: {
							status: 409,
							data: { message: "Email уже зарегистрирован" },
						},
					};
				}

				const mockUser: AuthUser = {
					id: Date.now().toString(),
					email: data.email,
					name: data.name,
					avatar: "https://github.com/shadcn.png",
					role: "user",
					accessToken: "mock-access-token-" + Date.now(),
					refreshToken: "mock-refresh-token-" + Date.now(),
				};

				return {
					data: {
						user: mockUser,
						accessToken: mockUser.accessToken,
						refreshToken: mockUser.refreshToken,
					},
				};
			},
			invalidatesTags: ["Auth", "Profile"],
			// Автоматически сохраняем пользователя при регистрации
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(setUser(data.user));
				} catch (error) {
					throw error;
				}
			},
		}),
	}),
});

// ============================================================================
// Export hooks
// ============================================================================

export const {
	useLoginMutation,
	useLogoutMutation,
	useRefreshTokenMutation,
	useGetProfileQuery,
	useUpdateProfileMutation,
	useRegisterMutation,
} = authApi;
