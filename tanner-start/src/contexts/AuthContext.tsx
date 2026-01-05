import { createContext, useContext, useEffect, type ReactNode } from "react";
// Импорт для интеграции с правами доступа
import { useProfile } from "@/hooks/useQueries";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/types";
import { usePermissionContext } from "./PermissionContext";

/**
 * Интерфейс контекста аутентификации
 */
interface AuthContextType {
	// Состояние
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Данные профиля с сервера
	profile: AuthUser | undefined;
	isProfileLoading: boolean;
	profileError: Error | null;

	// Действия
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	clearError: () => void;

	// Утилиты
	hasRole: (role: AuthUser["role"]) => boolean;
	canAccess: (requiredRole?: AuthUser["role"]) => boolean;

	// Методы для работы с токенами
	refreshTokens: () => Promise<void>;
	isTokenExpired: () => boolean;

	// Интеграция с правами доступа
	refreshPermissions: () => Promise<void>;
	hasPermission: (permission: string) => boolean;
	hasAllPermissions: (permissions: string[]) => boolean;
	hasAnyPermission: (permissions: string[]) => boolean;
}

/**
 * Контекст аутентификации
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Интерфейс пропсов провайдера
 */
interface AuthProviderProps {
	children: ReactNode;
	// Callback функции для интеграции с правами доступа
	onPermissionsRefresh?: () => Promise<void>;
	onPermissionsCheck?: {
		hasPermission: (permission: string) => boolean;
		hasAllPermissions: (permissions: string[]) => boolean;
		hasAnyPermission: (permissions: string[]) => boolean;
	};
}

/**
 * Провайдер контекста аутентификации
 */
export function AuthProvider({
	children,
	onPermissionsRefresh,
	onPermissionsCheck,
}: AuthProviderProps) {
	const {
		user,
		isAuthenticated,
		isLoading: storeLoading,
		error: storeError,
		login,
		logout,
		setLoading,
		setError,
		clearError,
	} = useAuthStore();

	// Получаем профиль пользователя с сервера
	const {
		data: profile,
		isLoading: isProfileLoading,
		error: profileError,
		refetch: refetchProfile,
	} = useProfile();

	// Получаем контекст прав доступа для интеграции
	const permissionContext = usePermissionContext();

	// Объединяем состояния загрузки
	const isLoading =
		storeLoading || isProfileLoading || permissionContext.isLoading;

	/**
	 * Вход в систему
	 */
	const signIn = async (email: string, password: string): Promise<void> => {
		try {
			setLoading(true);
			clearError();

			// В реальном приложении здесь будет API запрос
			// const response = await authApi.login({ email, password })

			// Симуляция API запроса
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const mockUser: AuthUser = {
				id: "1",
				email,
				name: "John Doe",
				avatar: "https://github.com/shadcn.png",
				role: "user",
				accessToken: "mock-access-token-" + Date.now(),
				refreshToken: "mock-refresh-token-" + Date.now(),
			};

			login(mockUser);

			// Обновляем профиль после входа
			await refetchProfile();

			// Загружаем права доступа после успешной аутентификации
			try {
				await permissionContext.refetchPermissions();
			} catch (permissionError) {
				console.warn(
					"Failed to load permissions after login:",
					permissionError,
				);
				// Не блокируем вход, если права доступа не загрузились
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Ошибка входа в систему";
			setError(errorMessage);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Выход из системы
	 */
	const signOut = async (): Promise<void> => {
		try {
			setLoading(true);

			// В реальном приложении здесь будет API запрос
			// await authApi.logout()

			// Симуляция API запроса
			await new Promise((resolve) => setTimeout(resolve, 500));

			logout();

			// Очищаем права доступа при выходе
			// Права доступа будут автоматически очищены при следующей загрузке PermissionProvider
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Ошибка выхода из системы";
			setError(errorMessage);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Проверка роли пользователя
	 */
	const hasRole = (role: AuthUser["role"]): boolean => {
		return user?.role === role;
	};

	/**
	 * Проверка прав доступа
	 */
	const canAccess = (requiredRole?: AuthUser["role"]): boolean => {
		if (!isAuthenticated || !user) return false;
		if (!requiredRole) return true;

		// Иерархия ролей: admin > moderator > user
		const roleHierarchy = {
			admin: 3,
			moderator: 2,
			user: 1,
		};

		return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
	};

	/**
	 * Обновление токенов
	 */
	const refreshTokens = async (): Promise<void> => {
		try {
			if (!user?.refreshToken) {
				throw new Error("Refresh token не найден");
			}

			setLoading(true);

			// В реальном приложении здесь будет API запрос
			// const response = await authApi.refreshToken(user.refreshToken)

			// Симуляция API запроса
			await new Promise((resolve) => setTimeout(resolve, 500));

			const newTokens = {
				accessToken: "new-access-token-" + Date.now(),
				refreshToken: "new-refresh-token-" + Date.now(),
			};

			// Обновляем токены в store
			login({
				...user,
				...newTokens,
			});
		} catch (error) {
			console.error("Failed to refresh tokens:", error);
			// Если не удалось обновить токены, выходим из системы
			logout();
			throw error;
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Проверка, истек ли токен
	 */
	const isTokenExpired = (): boolean => {
		if (!user?.accessToken) return true;

		try {
			// В реальном приложении здесь будет декодирование JWT токена
			// const decoded = jwt.decode(user.accessToken)
			// return decoded.exp * 1000 < Date.now()

			// Для демонстрации всегда возвращаем false
			return false;
		} catch (error) {
			console.error("Failed to decode token:", error);
			return true;
		}
	};

	/**
	 * Перезагрузка прав доступа
	 */
	const refreshPermissions = async (): Promise<void> => {
		try {
			await permissionContext.refetchPermissions();
		} catch (error) {
			console.error("Failed to refresh permissions:", error);
			throw error;
		}
	};

	/**
	 * Проверка наличия права доступа
	 */
	const hasPermission = (permission: string): boolean => {
		return permissionContext.hasPermission(permission);
	};

	/**
	 * Проверка наличия всех прав доступа
	 */
	const hasAllPermissions = (permissions: string[]): boolean => {
		return permissionContext.hasAllPermissions(permissions);
	};

	/**
	 * Проверка наличия хотя бы одного права доступа
	 */
	const hasAnyPermission = (permissions: string[]): boolean => {
		return permissionContext.hasAnyPermission(permissions);
	};

	/**
	 * Автоматическое обновление токенов
	 */
	useEffect(() => {
		if (!isAuthenticated || !user) return;

		// Проверяем токен каждые 5 минут
		const interval = setInterval(
			() => {
				if (isTokenExpired()) {
					refreshTokens().catch((error) => {
						console.error("Auto token refresh failed:", error);
					});
				}
			},
			5 * 60 * 1000,
		); // 5 минут

		return () => clearInterval(interval);
	}, [isAuthenticated, user]);

	/**
	 * Инициализация при загрузке приложения
	 */
	useEffect(() => {
		// Если пользователь авторизован, но профиль не загружен, загружаем его
		if (isAuthenticated && user && !profile && !isProfileLoading) {
			refetchProfile().catch((error) => {
				console.error("Failed to load profile on init:", error);
			});
		}
	}, [isAuthenticated, user, profile, isProfileLoading]);

	/**
	 * Автоматическая загрузка прав доступа при аутентификации
	 */
	useEffect(() => {
		// Если пользователь авторизован и права доступа не загружены, загружаем их
		if (
			isAuthenticated &&
			user &&
			!permissionContext.isLoading &&
			permissionContext.permissions.length === 0 &&
			!permissionContext.error
		) {
			permissionContext.refetchPermissions().catch((error) => {
				console.error("Failed to load permissions on auth init:", error);
			});
		}
	}, [isAuthenticated, user, permissionContext]);

	const contextValue: AuthContextType = {
		// Состояние
		user,
		isAuthenticated,
		isLoading,
		error:
			storeError ||
			profileError?.message ||
			permissionContext.error?.message ||
			null,

		// Данные профиля
		profile,
		isProfileLoading,
		profileError,

		// Действия
		signIn,
		signOut,
		clearError,

		// Утилиты
		hasRole,
		canAccess,

		// Методы для работы с токенами
		refreshTokens,
		isTokenExpired,

		// Интеграция с правами доступа
		refreshPermissions,
		hasPermission,
		hasAllPermissions,
		hasAnyPermission,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
}

/**
 * Хук для использования контекста аутентификации
 */
export function useAuthContext(): AuthContextType {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}

	return context;
}

/**
 * HOC для компонентов, требующих аутентификации
 */
export function withAuth<P extends object>(
	Component: React.ComponentType<P>,
	requiredRole?: AuthUser["role"],
) {
	return function AuthenticatedComponent(props: P) {
		const { isAuthenticated, canAccess, isLoading } = useAuthContext();

		if (isLoading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			);
		}

		if (!isAuthenticated || !canAccess(requiredRole)) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Доступ запрещен</h2>
						<p className="text-muted-foreground">
							{!isAuthenticated
								? "Необходима авторизация"
								: "Недостаточно прав доступа"}
						</p>
					</div>
				</div>
			);
		}

		return <Component {...props} />;
	};
}

/**
 * HOC для компонентов, требующих определенных прав доступа
 */
export function withPermissions<P extends object>(
	Component: React.ComponentType<P>,
	requiredPermissions: string[],
	requireAll = true,
) {
	return function PermissionProtectedComponent(props: P) {
		const { isAuthenticated, isLoading, hasAllPermissions, hasAnyPermission } =
			useAuthContext();

		if (isLoading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			);
		}

		if (!isAuthenticated) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Доступ запрещен</h2>
						<p className="text-muted-foreground">Необходима авторизация</p>
					</div>
				</div>
			);
		}

		const hasRequiredPermissions = requireAll
			? hasAllPermissions(requiredPermissions)
			: hasAnyPermission(requiredPermissions);

		if (!hasRequiredPermissions) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Доступ запрещен</h2>
						<p className="text-muted-foreground">
							Недостаточно прав доступа для просмотра этой страницы
						</p>
						{process.env.NODE_ENV === "development" && (
							<details className="mt-4 text-sm text-left">
								<summary className="cursor-pointer">
									Требуемые права доступа
								</summary>
								<ul className="mt-2 list-disc list-inside">
									{requiredPermissions.map((permission) => (
										<li key={permission}>{permission}</li>
									))}
								</ul>
							</details>
						)}
					</div>
				</div>
			);
		}

		return <Component {...props} />;
	};
}
