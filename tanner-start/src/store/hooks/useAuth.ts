import type { AuthUser } from "@/types";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
	clearError,
	fetchProfileAsync,
	loginAsync,
	logoutAsync,
	refreshTokensAsync,
	selectAuthError,
	selectIsAuthenticated,
	selectIsLoading,
	selectUser,
} from "../slices/authSlice";
import { canAccess, hasRole } from "../slices/authUtils";

/**
 * Хук для работы с авторизацией
 * Предоставляет удобный API для всех операций с auth
 */
export const useAuth = () => {
	const dispatch = useAppDispatch();

	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isLoading = useAppSelector(selectIsLoading);
	const error = useAppSelector(selectAuthError);

	/**
	 * Вход в систему
	 */
	const login = useCallback(
		async (email: string, password: string) => {
			try {
				const result = await dispatch(loginAsync({ email, password })).unwrap();
				return result;
			} catch (error) {
				throw error;
			}
		},
		[dispatch],
	);

	/**
	 * Выход из системы
	 */
	const logout = useCallback(async () => {
		try {
			await dispatch(logoutAsync()).unwrap();
		} catch (error) {
			throw error;
		}
	}, [dispatch]);

	/**
	 * Обновление токенов
	 */
	const refreshTokens = useCallback(async () => {
		if (!user?.refreshToken) {
			throw new Error("Refresh token not found");
		}

		try {
			await dispatch(refreshTokensAsync(user.refreshToken)).unwrap();
		} catch (error) {
			throw error;
		}
	}, [dispatch, user?.refreshToken]);

	/**
	 * Загрузка профиля
	 */
	const fetchProfile = useCallback(async () => {
		try {
			const result = await dispatch(fetchProfileAsync()).unwrap();
			return result;
		} catch (error) {
			throw error;
		}
	}, [dispatch]);

	/**
	 * Очистка ошибки
	 */
	const clearAuthError = useCallback(() => {
		dispatch(clearError());
	}, [dispatch]);

	/**
	 * Проверка роли пользователя
	 */
	const checkRole = useCallback(
		(role: AuthUser["role"]) => {
			return hasRole(user, role);
		},
		[user],
	);

	/**
	 * Проверка прав доступа
	 */
	const checkAccess = useCallback(
		(requiredRole?: AuthUser["role"]) => {
			return canAccess(user, requiredRole);
		},
		[user],
	);

	return {
		// Состояние
		user,
		isAuthenticated,
		isLoading,
		error,

		// Действия
		login,
		logout,
		refreshTokens,
		fetchProfile,
		clearError: clearAuthError,

		// Утилиты
		hasRole: checkRole,
		canAccess: checkAccess,
	};
};
