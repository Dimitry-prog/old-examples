import { UserInfo } from "@/components/auth/UserInfo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { RoleBasedRender } from "@/components/guards/RouteGuard";
import { useAuthContext } from "@/contexts/AuthContext";
import { useApp } from "@/hooks/useApp";
import { Trans } from "@lingui/react/macro";
import { Link, useParams } from "@tanstack/react-router";

export function Navigation() {
	const { isAuthenticated } = useAuthContext();
	const { theme, setTheme } = useApp();
	const params = useParams({ from: "/$locale/_layout" });
	const locale = params.locale;

	const toggleTheme = () => {
		const themes: Array<typeof theme> = ["light", "dark", "system"];
		const currentIndex = themes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		const nextTheme = themes[nextIndex];
		if (nextTheme) {
			setTheme(nextTheme);
		}
	};

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-14 items-center justify-between">
					<div className="flex items-center space-x-4">
						<Link
							to="/$locale/"
							params={{ locale }}
							className="text-lg font-semibold text-foreground hover:text-foreground/80"
						>
							Modern React Stack
						</Link>
					</div>

					<div className="flex items-center space-x-6">
						{/* Публичные маршруты */}
						<Link
							to="/$locale/"
							params={{ locale }}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							activeProps={{
								className: "text-foreground",
							}}
						>
							<Trans>Главная</Trans>
						</Link>
						<Link
							to="/$locale/about"
							params={{ locale }}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							activeProps={{
								className: "text-foreground",
							}}
						>
							<Trans>О проекте</Trans>
						</Link>

						{/* Переключатель языка */}
						<LanguageSwitcher />

						{/* Переключатель темы */}
						<button
							type="button"
							onClick={toggleTheme}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							title={`Текущая тема: ${theme}`}
						>
							{theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🌓"}
						</button>

						{/* Условная навигация в зависимости от аутентификации */}
						{isAuthenticated ? (
							<>
								<Link
									to="/$locale/dashboard"
									params={{ locale }}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									activeProps={{
										className: "text-foreground",
									}}
								>
									<Trans>Панель</Trans>
								</Link>

								<Link
									to="/$locale/examples/i18n"
									params={{ locale }}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									activeProps={{
										className: "text-foreground",
									}}
								>
									<Trans>i18n Примеры</Trans>
								</Link>

								<RoleBasedRender requiredRole="moderator">
									<Link
										to="/$locale/admin"
										params={{ locale }}
										className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
										activeProps={{
											className: "text-foreground",
										}}
									>
										<Trans>Управление</Trans>
									</Link>
								</RoleBasedRender>

								<UserInfo />
							</>
						) : (
							<Link
								to="/$locale/login"
								params={{ locale }}
								className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
							>
								<Trans>Войти</Trans>
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
