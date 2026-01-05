import type { AuthUser } from "@/types";
import { useCallback } from "react";
import {
	useGetProfileQuery,
	useLoginMutation,
	useLogoutMutation,
	useRefreshTokenMutation,
	useRegisterMutation,
	useUpdateProfileMutation,
} from "../api/authApi";
import { useAppSelector } from "../hooks";
import { selectIsAuthenticated, selectUser } from "../slices/authSlice";
import { canAccess, hasRole } from "../slices/authUtils";

/**
 * Хук для работы с авторизацией через RTK Query
 * Более современный подход с автоматическим кешированием
 */
export const useAuthRTK = () => {
	// Локальное состояние из Redux
	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	// RTK Query mutations
	const [loginMutation, { isLoading: isLoginLoading, error: loginError }] =
		useLoginMutation();
	const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
	const [refreshTokenMutation, { isLoading: isRefreshLoading }] =
		useRefreshTokenMutation();
	const [updateProfileMutation, { isLoading: isUpdateLoading }] =
		useUpdateProfileMutation();
	const [
		registerMutation,
		{ isLoading: isRegisterLoading, error: registerError },
	] = useRegisterMutation();

	// RTK Query query
	const {
		data: profile,
		isLoading: isProfileLoading,
		error: profileError,
		refetch: refetchProfile,
	} = useGetProfileQuery(undefined, {
		skip: !isAuthenticated, // Не загружаем профиль, если не авторизованы
	});

	// Общий статус загрузки
	const isLoading =
		isLoginLoading ||
		isLogoutLoading ||
		isRefreshLoading ||
		isUpdateLoading ||
		isRegisterLoading ||
		isProfileLoading;

	/**
	 * Вход в систему
	 * Redux store обновляется автоматически через onQueryStarted в API
	 */
	const login = useCallback(
		async (email: string, password: string) => {
			return await loginMutation({ email, password }).unwrap();
		},
		[loginMutation],
	);

	/**
	 * Регистрация
	 * Redux store обновляется автоматически через onQueryStarted в API
	 */
	const register = useCallback(
		async (email: string, password: string, name: string) => {
			return await registerMutation({ email, password, name }).unwrap();
		},
		[registerMutation],
	);

	/**
	 * Выход из системы
	 * Redux store очищается автоматически через onQueryStarted в API
	 */
	const logout = useCallback(async () => {
		return await logoutMutation().unwrap();
	}, [logoutMutation]);

	/**
	 * Обновление токенов
	 * Redux store обновляется автоматически через onQueryStarted в API
	 */
	const refreshTokens = useCallback(async () => {
		if (!user?.refreshToken) {
			throw new Error("Refresh token not found");
		}

		return await refreshTokenMutation({
			refreshToken: user.refreshToken,
		}).unwrap();
	}, [user?.refreshToken, refreshTokenMutation]);

	/**
	 * Обновление профиля
	 * Redux store обновляется автоматически через onQueryStarted в API
	 */
	const updateProfile = useCallback(
		async (updates: Partial<AuthUser>) => {
			return await updateProfileMutation(updates).unwrap();
		},
		[updateProfileMutation],
	);

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
		profile, // Профиль с сервера (может отличаться от user)
		isAuthenticated,
		isLoading,

		// Ошибки
		loginError,
		registerError,
		profileError,

		// Действия
		login,
		register,
		logout,
		refreshTokens,
		updateProfile,
		refetchProfile,

		// Утилиты
		hasRole: checkRole,
		canAccess: checkAccess,
	};
};
