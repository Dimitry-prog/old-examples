import { UserInfo } from "@/components/auth/UserInfo";
import { RoleBasedRender } from "@/components/guards/RouteGuard";
import { useAuthContext } from "@/contexts/AuthContext";
import { useApp } from "@/hooks/useApp";
import { usePreloadOnHover } from "@/lib/lazyComponents";
import { Link } from "@tanstack/react-router";

/**
 * Навигация с предзагрузкой страниц
 * Использует usePreloadOnHover для предзагрузки компонентов при наведении
 */
export function NavigationWithPreload() {
	const { isAuthenticated } = useAuthContext();
	const { theme, toggleTheme } = useApp();

	// Предзагрузка для страницы примеров
	const preloadExamples = usePreloadOnHover(
		() => import("@/routes/_authenticated/examples"),
	);

	// Предзагрузка для dashboard
	const preloadDashboard = usePreloadOnHover(
		() => import("@/routes/_authenticated/dashboard"),
	);

	// Предзагрузка для profile
	const preloadProfile = usePreloadOnHover(
		() => import("@/routes/_authenticated/profile"),
	);

	// Предзагрузка для settings
	const preloadSettings = usePreloadOnHover(
		() => import("@/routes/_authenticated/settings"),
	);

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-14 items-center justify-between">
					<div className="flex items-center space-x-4">
						<Link
							to="/"
							className="text-lg font-semibold text-foreground hover:text-foreground/80"
						>
							Modern React Stack
						</Link>
					</div>

					<div className="flex items-center space-x-6">
						{/* Публичные маршруты */}
						<Link
							to="/"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							activeProps={{
								className: "text-foreground",
							}}
						>
							Главная
						</Link>
						<Link
							to="/about"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							activeProps={{
								className: "text-foreground",
							}}
						>
							О проекте
						</Link>

						{/* Приватные маршруты с предзагрузкой */}
						{isAuthenticated && (
							<>
								<Link
									to="/dashboard"
									{...preloadDashboard}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									activeProps={{
										className: "text-foreground",
									}}
								>
									Панель
								</Link>
								<Link
									to="/examples"
									{...preloadExamples}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									activeProps={{
										className: "text-foreground",
									}}
								>
									Примеры
								</Link>
								<Link
									to="/profile"
									{...preloadProfile}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									activeProps={{
										className: "text-foreground",
									}}
								>
									Профиль
								</Link>
								<Link
									to="/settings"
									{...preloadSettings}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									activeProps={{
										className: "text-foreground",
									}}
								>
									Настройки
								</Link>
							</>
						)}

						{/* Переключатель темы */}
						<button
							onClick={toggleTheme}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							title={`Текущая тема: ${theme}`}
						>
							{theme === "dark" ? "🌙" : "☀️"}
						</button>

						{/* Информация о пользователе */}
						{isAuthenticated ? (
							<UserInfo />
						) : (
							<Link
								to="/login"
								className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
							>
								Войти
							</Link>
						)}

						{/* Админ панель (только для админов) */}
						<RoleBasedRender allowedRoles={["admin"]}>
							<Link
								to="/admin"
								className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
								activeProps={{
									className: "text-destructive",
								}}
							>
								Админ
							</Link>
						</RoleBasedRender>
					</div>
				</div>
			</div>
		</nav>
	);
}
