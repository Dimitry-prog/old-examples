import { useAuthContext } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useZodForm } from "@/hooks/useZodForm";
import { loginSchema, type LoginFormData } from "@/lib/formSchemas";
import { useState } from "react";

/**
 * Компонент формы входа в систему
 */
export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);

	const { login, isLoginPending, loginError } = useAuthActions();
	const { error: contextError, clearError } = useAuthContext();

	const form = useZodForm(loginSchema, {
		defaultValues: {
			email: "",
			password: "",
			remember: false,
		},
	});

	const handleSubmit = async (data: LoginFormData) => {
		try {
			await login({
				email: data.email,
				password: data.password,
				remember: data.remember,
			});
		} catch (error) {
			// Ошибка уже обработана в хуке
			console.error("Login form error:", error);
		}
	};

	// Очищаем ошибки при изменении полей
	const handleInputChange = () => {
		if (contextError || loginError) {
			clearError();
		}
	};

	const error = loginError?.message || contextError;

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-lg">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold">Вход в систему</h2>
					<p className="text-muted-foreground mt-2">
						Введите свои данные для входа
					</p>
				</div>

				<form
					onSubmit={form.handleSubmitWithValidation(handleSubmit)}
					className="space-y-4"
				>
					{/* Email */}
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<input
							id="email"
							{...form.register("email", { onChange: handleInputChange })}
							type="email"
							placeholder="your@email.com"
							className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							disabled={isLoginPending}
						/>
						{form.formState.errors.email && (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						)}
					</div>

					{/* Password */}
					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							Пароль
						</label>
						<div className="relative">
							<input
								id="password"
								{...form.register("password", { onChange: handleInputChange })}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								disabled={isLoginPending}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
								disabled={isLoginPending}
							>
								{showPassword ? (
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Hide password</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								) : (
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Show password</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>
						{form.formState.errors.password && (
							<p className="text-sm text-destructive">
								{form.formState.errors.password.message}
							</p>
						)}
					</div>

					{/* Remember me */}
					<div className="flex items-center space-x-2">
						<input
							id="remember"
							{...form.register("remember")}
							type="checkbox"
							className="rounded border-border"
							disabled={isLoginPending}
						/>
						<label htmlFor="remember" className="text-sm text-muted-foreground">
							Запомнить меня
						</label>
					</div>

					{/* Error message */}
					{error && (
						<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					{/* Submit button */}
					<button
						type="submit"
						disabled={
							isLoginPending || form.isSubmitting || !form.formState.isValid
						}
						className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isLoginPending || form.isSubmitting ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
								Вход...
							</>
						) : (
							"Войти"
						)}
					</button>
				</form>

				{/* Additional links */}
				<div className="mt-6 text-center space-y-2">
					<button
						type="button"
						className="text-sm text-primary hover:underline"
						disabled={isLoginPending}
					>
						Забыли пароль?
					</button>

					<div className="text-sm text-muted-foreground">
						Нет аккаунта?{" "}
						<button
							type="button"
							className="text-primary hover:underline"
							disabled={isLoginPending}
						>
							Зарегистрироваться
						</button>
					</div>
				</div>

				{/* Demo credentials */}
				<div className="mt-6 p-3 bg-muted rounded-md">
					<p className="text-xs text-muted-foreground mb-2">
						Демо данные для входа:
					</p>
					<div className="text-xs space-y-1">
						<div>Email: admin@example.com (Админ)</div>
						<div>Email: moderator@example.com (Модератор)</div>
						<div>Email: user@example.com (Пользователь)</div>
						<div>Пароль: любой</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Компонент быстрого входа для демонстрации
 */
export function QuickLoginButtons() {
	const { login, isLoginPending } = useAuthActions();

	const quickLogin = async (role: "admin" | "moderator" | "user") => {
		const credentials = {
			email: `${role}@example.com`,
			password: "demo",
		};

		try {
			await login(credentials);
		} catch (error) {
			console.error("Quick login failed:", error);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto mt-4">
			<div className="bg-card text-card-foreground rounded-lg border p-4">
				<h3 className="text-sm font-medium mb-3">Быстрый вход (демо)</h3>
				<div className="grid grid-cols-3 gap-2">
					<button
						type="button"
						onClick={() => quickLogin("admin")}
						disabled={isLoginPending}
						className="px-3 py-2 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
					>
						👑 Админ
					</button>
					<button
						type="button"
						onClick={() => quickLogin("moderator")}
						disabled={isLoginPending}
						className="px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
					>
						🛡️ Модератор
					</button>
					<button
						type="button"
						onClick={() => quickLogin("user")}
						disabled={isLoginPending}
						className="px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
					>
						👤 Пользователь
					</button>
				</div>
			</div>
		</div>
	);
}
