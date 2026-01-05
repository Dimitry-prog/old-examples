import type { AuthUser } from "@/types";
import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";

// ============================================================================
// Types
// ============================================================================

export interface AuthState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	lastLoginTime: number | null;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: AuthUser;
	accessToken: string;
	refreshToken: string;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	lastLoginTime: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Вход в систему
 */
export const loginAsync = createAsyncThunk<
	LoginResponse,
	LoginCredentials,
	{ rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
	try {
		// В реальном приложении здесь будет API запрос
		// const response = await authApi.login(credentials);

		// Симуляция API запроса
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Симуляция ошибки для демонстрации
		if (credentials.email === "error@test.com") {
			throw new Error("Неверный email или пароль");
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
			user: mockUser,
			accessToken: mockUser.accessToken,
			refreshToken: mockUser.refreshToken,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Ошибка входа в систему";
		return rejectWithValue(message);
	}
});

/**
 * Выход из системы
 */
export const logoutAsync = createAsyncThunk<
	void,
	void,
	{ rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
	try {
		// В реальном приложении здесь будет API запрос
		// await authApi.logout();

		// Симуляция API запроса
		await new Promise((resolve) => setTimeout(resolve, 500));
		return;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Ошибка выхода из системы";
		return rejectWithValue(message);
	}
});

/**
 * Обновление токенов
 */
export const refreshTokensAsync = createAsyncThunk<
	{ accessToken: string; refreshToken: string },
	string,
	{ rejectValue: string }
>("auth/refreshTokens", async (currentRefreshToken, { rejectWithValue }) => {
	try {
		// В реальном приложении здесь будет API запрос
		// const response = await authApi.refreshToken(currentRefreshToken);

		// Симуляция API запроса
		await new Promise((resolve) => setTimeout(resolve, 500));

		return {
			accessToken: "new-access-token-" + Date.now(),
			refreshToken: "new-refresh-token-" + Date.now(),
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Ошибка обновления токенов";
		return rejectWithValue(message);
	}
});

/**
 * Загрузка профиля пользователя
 */
export const fetchProfileAsync = createAsyncThunk<
	AuthUser,
	void,
	{ rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
	try {
		// В реальном приложении здесь будет API запрос
		// const response = await authApi.getProfile();

		// Симуляция API запроса
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

		return mockProfile;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Ошибка загрузки профиля";
		return rejectWithValue(message);
	}
});

// ============================================================================
// Slice
// ============================================================================

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Синхронные actions
		setUser: (state, action: PayloadAction<AuthUser>) => {
			state.user = action.payload;
			state.isAuthenticated = true;
			state.error = null;
		},
		clearUser: (state) => {
			state.user = null;
			state.isAuthenticated = false;
			state.error = null;
			state.lastLoginTime = null;
		},
		clearError: (state) => {
			state.error = null;
		},
		updateUserProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		},
	},
	extraReducers: (builder) => {
		// Login
		builder
			.addCase(loginAsync.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload.user;
				state.isAuthenticated = true;
				state.lastLoginTime = Date.now();
				state.error = null;
			})
			.addCase(loginAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Ошибка входа в систему";
			});

		// Logout
		builder
			.addCase(logoutAsync.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(logoutAsync.fulfilled, (state) => {
				state.isLoading = false;
				state.user = null;
				state.isAuthenticated = false;
				state.lastLoginTime = null;
				state.error = null;
			})
			.addCase(logoutAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Ошибка выхода из системы";
				// Даже при ошибке выходим из системы
				state.user = null;
				state.isAuthenticated = false;
			});

		// Refresh Tokens
		builder
			.addCase(refreshTokensAsync.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(refreshTokensAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				if (state.user) {
					state.user.accessToken = action.payload.accessToken;
					state.user.refreshToken = action.payload.refreshToken;
				}
				state.error = null;
			})
			.addCase(refreshTokensAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Ошибка обновления токенов";
				// При ошибке обновления токенов выходим из системы
				state.user = null;
				state.isAuthenticated = false;
			});

		// Fetch Profile
		builder
			.addCase(fetchProfileAsync.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchProfileAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(fetchProfileAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Ошибка загрузки профиля";
			});
	},
});

// ============================================================================
// Actions
// ============================================================================

export const { setUser, clearUser, clearError, updateUserProfile } =
	authSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
	state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
	state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// ============================================================================
// Export
// ============================================================================

export default authSlice.reducer;
