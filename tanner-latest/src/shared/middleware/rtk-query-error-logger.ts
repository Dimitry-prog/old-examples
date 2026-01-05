import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";

/**
 * Middleware для глобальной обработки ошибок RTK Query
 * Обрабатывает:
 * - 401 (Unauthorized) - перенаправление на страницу входа
 * - 500+ (Server errors) - серверные ошибки
 * - FETCH_ERROR, PARSING_ERROR - неожиданные ошибки
 *
 * Ошибки 4xx (кроме 401) обрабатываются в компонентах
 */
export const rtkQueryErrorLogger: Middleware =
	(_api: MiddlewareAPI) => (next) => (action) => {
		if (isRejectedWithValue(action)) {
			const error = action.payload;

			// Проверяем тип ошибки
			if (error && typeof error === "object" && "status" in error) {
				const status = error.status;

				// 401 - Unauthorized
				if (status === 401) {
					console.warn("Unauthorized: перенаправление на страницу входа");
					// Очищаем токен
					localStorage.removeItem("authToken");
					// Перенаправляем на страницу входа
					window.location.href = "/login";
					return next(action);
				}

				// Серверные ошибки (500+)
				if (typeof status === "number" && status >= 500) {
					console.error("Серверная ошибка:", {
						status,
						data: "data" in error ? error.data : undefined,
					});

					// Здесь можно добавить toast уведомление
					// toast.error('Произошла ошибка сервера. Попробуйте позже.')
				}

				// Неожиданные ошибки (проблемы с сетью, парсингом и т.д.)
				if (status === "FETCH_ERROR" || status === "PARSING_ERROR") {
					console.error("Неожиданная ошибка:", {
						status,
						error: "error" in error ? error.error : undefined,
					});

					// toast.error('Произошла неожиданная ошибка. Проверьте соединение.')
				}
			} else {
				// Неизвестная ошибка
				console.error("Неизвестная ошибка:", error);
				// toast.error('Произошла неизвестная ошибка.')
			}
		}

		return next(action);
	};
