import type { AuthUser } from "@/types";

/**
 * Утилиты для работы с авторизацией
 */

/**
 * Проверка роли пользователя
 */
export const hasRole = (
	user: AuthUser | null,
	role: AuthUser["role"],
): boolean => {
	return user?.role === role;
};

/**
 * Проверка прав доступа с учётом иерархии ролей
 */
export const canAccess = (
	user: AuthUser | null,
	requiredRole?: AuthUser["role"],
): boolean => {
	if (!user) return false;
	if (!requiredRole) return true;

	// Иерархия ролей: admin > moderator > user
	const roleHierarchy: Record<AuthUser["role"], number> = {
		admin: 3,
		moderator: 2,
		user: 1,
	};

	return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

/**
 * Проверка, истёк ли токен
 * В реальном приложении здесь будет декодирование JWT
 */
export const isTokenExpired = (token: string): boolean => {
	try {
		// В реальном приложении:
		// const decoded = jwt.decode(token);
		// return decoded.exp * 1000 < Date.now();

		// Для демонстрации всегда возвращаем false
		return false;
	} catch (error) {
		console.error("Failed to decode token:", error);
		return true;
	}
};

/**
 * Получение времени до истечения токена (в миллисекундах)
 */
export const getTokenExpirationTime = (token: string): number | null => {
	try {
		// В реальном приложении:
		// const decoded = jwt.decode(token);
		// return decoded.exp * 1000 - Date.now();

		// Для демонстрации возвращаем 1 час
		return 60 * 60 * 1000;
	} catch (error) {
		console.error("Failed to decode token:", error);
		return null;
	}
};

/**
 * Форматирование имени пользователя
 */
export const formatUserName = (user: AuthUser | null): string => {
	if (!user) return "Guest";
	return user.name || user.email?.split("@")[0] || "User";
};

/**
 * Получение инициалов пользователя
 */
export const getUserInitials = (user: AuthUser | null): string => {
	if (!user) return "G";

	const name = user.name || user.email;
	const parts = name?.split(" ") || [];

	if (parts.length >= 2 && parts[0] && parts[1]) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}

	return name?.substring(0, 2).toUpperCase() || "U";
};

/**
 * Проверка валидности email
 */
export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

/**
 * Проверка силы пароля
 */
export const getPasswordStrength = (
	password: string,
): {
	score: number;
	label: "weak" | "medium" | "strong" | "very-strong";
} => {
	let score = 0;

	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[a-z]/.test(password)) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^a-zA-Z0-9]/.test(password)) score++;

	if (score <= 2) return { score, label: "weak" };
	if (score <= 4) return { score, label: "medium" };
	if (score <= 5) return { score, label: "strong" };
	return { score, label: "very-strong" };
};
