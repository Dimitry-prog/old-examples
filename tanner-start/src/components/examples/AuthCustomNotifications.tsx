import { useState } from "react";
import { notify } from "../../store/api/notifications";
import { useAuthRTK } from "../../store/hooks/useAuthRTK";

/**
 * Примеры переопределения глобальных уведомлений
 */
export function AuthCustomNotifications() {
	const { user, isAuthenticated, login, logout } = useAuthRTK();
	const [email, setEmail] = useState("user@example.com");
	const [password, setPassword] = useState("password123");

	// ============================================================================
	// Способ 1: Флаг silent + кастомное сообщение
	// ============================================================================
	const handleLoginWithCustomSuccess = async () => {
		try {
			// @ts-expect-error - silent добавлен в LoginRequest
			await login(email, password, { silent: true });
			// Кастомное сообщение успеха
			notify.success("🎉 Вы успешно вошли в систему!");
		} catch (error) {
			// Кастомная обработка ошибки
			notify.error("😢 Не удалось войти. Проверьте данные");
		}
	};

	// ============================================================================
	// Способ 2: try-catch с дополнительной логикой
	// ============================================================================
	const handleLoginWithRedirect = async () => {
		try {
			await login(email, password);
			// Глобальный toast уже показан
			// Добавляем дополнительную логику
			console.log("Redirecting to dashboard...");
			// navigate('/dashboard');
		} catch (error) {
			// Глобальный toast уже показан
			// Добавляем дополнительную логику
			console.error("Login failed, staying on login page");
		}
	};

	// ============================================================================
	// Способ 3: Полное переопределение с silent
	// ============================================================================
	const handleLoginSilent = async () => {
		try {
			// @ts-expect-error
			await login(email, password, { silent: true });
			// Полностью кастомная логика
			alert("Login successful!");
		} catch (error: any) {
			// Полностью кастомная обработка
			if (error?.status === 401) {
				alert("Wrong credentials!");
			} else {
				alert("Something went wrong!");
			}
		}
	};

	// ============================================================================
	// Способ 4: Условное переопределение
	// ============================================================================
	const handleLoginConditional = async () => {
		const isSpecialUser = email.includes("admin");

		try {
			// @ts-expect-error
			await login(email, password, { silent: isSpecialUser });

			if (isSpecialUser) {
				// Кастомное сообщение для админа
				notify.success("🔐 Добро пожаловать, администратор!");
			}
			// Для обычных пользователей - глобальное сообщение
		} catch (error) {
			if (isSpecialUser) {
				notify.error("❌ Ошибка входа администратора");
			}
			// Для обычных пользователей - глобальное сообщение
		}
	};

	// ============================================================================
	// Способ 5: Без уведомлений вообще
	// ============================================================================
	const handleLoginNoNotifications = async () => {
		try {
			// @ts-expect-error
			await login(email, password, { silent: true });
			// Никаких уведомлений
			console.log("Logged in silently");
		} catch (error) {
			// Никаких уведомлений
			console.error("Login failed silently");
		}
	};

	// ============================================================================
	// Способ 6: Разные сообщения для разных ошибок
	// ============================================================================
	const handleLoginWithDetailedErrors = async () => {
		try {
			// @ts-expect-error
			await login(email, password, { silent: true });
			notify.success("✅ Вход выполнен успешно!");
		} catch (error: any) {
			// Детальная обработка ошибок
			switch (error?.status) {
				case 401:
					notify.error("🔒 Неверный email или пароль");
					break;
				case 403:
					notify.error("⛔ Ваш аккаунт заблокирован");
					break;
				case 429:
					notify.error("⏰ Слишком много попыток. Подождите 5 минут");
					break;
				case 500:
					notify.error("🔧 Проблемы на сервере. Попробуйте позже");
					break;
				default:
					notify.error("❌ Произошла ошибка");
			}
		}
	};

	return (
		<div className="p-6 space-y-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold">Кастомные уведомления</h2>
			<p className="text-gray-600">
				Примеры переопределения глобальных уведомлений
			</p>

			{/* Auth Status */}
			<div className="p-4 bg-gray-100 rounded">
				<p>
					<strong>Status:</strong>{" "}
					{isAuthenticated ? (
						<span className="text-green-600">
							Authenticated as {user?.name}
						</span>
					) : (
						<span className="text-gray-600">Not authenticated</span>
					)}
				</p>
			</div>

			{/* Login Form */}
			{!isAuthenticated && (
				<div className="space-y-4">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="w-full px-4 py-2 border rounded"
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						className="w-full px-4 py-2 border rounded"
					/>

					<div className="space-y-2">
						<h3 className="font-bold">Способы переопределения:</h3>

						<button
							type="button"
							onClick={handleLoginWithCustomSuccess}
							className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-left"
						>
							1. Кастомное сообщение успеха
						</button>

						<button
							type="button"
							onClick={handleLoginWithRedirect}
							className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-left"
						>
							2. С дополнительной логикой (redirect)
						</button>

						<button
							type="button"
							onClick={handleLoginSilent}
							className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-left"
						>
							3. Полное переопределение (alert)
						</button>

						<button
							type="button"
							onClick={handleLoginConditional}
							className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-left"
						>
							4. Условное переопределение (admin)
						</button>

						<button
							type="button"
							onClick={handleLoginNoNotifications}
							className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-left"
						>
							5. Без уведомлений
						</button>

						<button
							type="button"
							onClick={handleLoginWithDetailedErrors}
							className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-left"
						>
							6. Детальные ошибки
						</button>
					</div>

					<div className="text-sm text-gray-600 space-y-1">
						<p>💡 Tips:</p>
						<ul className="list-disc list-inside">
							<li>Use "error@test.com" to test error handling</li>
							<li>Use "admin@test.com" for conditional example</li>
						</ul>
					</div>
				</div>
			)}

			{/* Logout */}
			{isAuthenticated && (
				<button
					type="button"
					onClick={logout}
					className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
				>
					Logout
				</button>
			)}

			{/* Code Examples */}
			<div className="p-4 bg-gray-50 rounded space-y-4">
				<h3 className="font-bold">Примеры кода:</h3>

				<div>
					<p className="text-sm font-semibold mb-1">1. Кастомное сообщение:</p>
					<pre className="text-xs overflow-x-auto bg-white p-2 rounded">
						{`try {
  await login(email, password, { silent: true });
  notify.success('🎉 Кастомное сообщение!');
} catch (error) {
  notify.error('😢 Кастомная ошибка!');
}`}
					</pre>
				</div>

				<div>
					<p className="text-sm font-semibold mb-1">
						2. С дополнительной логикой:
					</p>
					<pre className="text-xs overflow-x-auto bg-white p-2 rounded">
						{`try {
  await login(email, password);
  // Глобальный toast показан
  navigate('/dashboard');
} catch (error) {
  // Глобальный toast показан
  console.error('Failed');
}`}
					</pre>
				</div>

				<div>
					<p className="text-sm font-semibold mb-1">3. Детальные ошибки:</p>
					<pre className="text-xs overflow-x-auto bg-white p-2 rounded">
						{`try {
  await login(email, password, { silent: true });
} catch (error) {
  if (error.status === 401) {
    notify.error('Неверные данные');
  } else if (error.status === 429) {
    notify.error('Слишком много попыток');
  }
}`}
					</pre>
				</div>
			</div>
		</div>
	);
}
