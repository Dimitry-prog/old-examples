import type { MiddlewareAPI } from "@reduxjs/toolkit";
import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";

/**
 * Глобальный middleware для обработки ошибок RTK Query
 * Ловит все непредвиденные ошибки (502, 504, network errors, etc.)
 */
export const rtkQueryErrorLogger: Middleware =
	(_api: MiddlewareAPI) => (next) => (action) => {
		// RTK Query использует createAsyncThunk, поэтому можем использовать isRejectedWithValue
		if (isRejectedWithValue(action)) {
			console.warn("RTK Query Error:", action);

			const error = action.payload;

			// Обрабатываем только непредвиденные ошибки
			// Ожидаемые ошибки (401, 403, 404) обрабатываются в компонентах
			if (error && typeof error === "object" && "status" in error) {
				const status = error.status as number;

				// Непредвиденные серверные ошибки
				if (status >= 500) {
					showGlobalError({
						title: "Ошибка сервера",
						message: `Сервер временно недоступен (${status}). Попробуйте позже.`,
						status,
					});
					return next(action);
				}

				// Сетевые ошибки
				if (
					typeof status === "string" &&
					(status === "FETCH_ERROR" || status === "PARSING_ERROR")
				) {
					showGlobalError({
						title: "Ошибка подключения",
						message: "Проверьте подключение к интернету",
						status: "NETWORK_ERROR",
					});
					return next(action);
				}

				// Timeout ошибки
				if (typeof status === "string" && status === "TIMEOUT_ERROR") {
					showGlobalError({
						title: "Превышено время ожидания",
						message: "Сервер не отвечает. Попробуйте позже.",
						status: "TIMEOUT",
					});
					return next(action);
				}
			}

			// Неизвестные ошибки
			if (error && typeof error === "object" && "message" in error) {
				showGlobalError({
					title: "Непредвиденная ошибка",
					message: String(error.message),
					status: "UNKNOWN",
				});
			}
		}

		return next(action);
	};

/**
 * Показать глобальное уведомление об ошибке
 * Можно заменить на вашу систему уведомлений
 */
function showGlobalError(error: {
	title: string;
	message: string;
	status: number | string;
}) {
	// Здесь можно использовать вашу toast библиотеку
	// Например: toast.error(error.message)

	// Или показать модальное окно для критических ошибок
	// Или отправить в систему мониторинга (Sentry, LogRocket, etc.)

	console.error("🚨 Global Error:", error);

	// Пример с toast (раскомментируйте когда подключите библиотеку)
	// import { toast } from 'react-hot-toast';
	// toast.error(`${error.title}: ${error.message}`);

	// Пример с кастомным UI
	// window.dispatchEvent(new CustomEvent('app:global-error', { detail: error }));
}

/**
 * Проверка, является ли ошибка ожидаемой (обрабатывается в компоненте)
 */
export function isExpectedError(status: number): boolean {
	// Ожидаемые ошибки, которые обрабатываются в компонентах
	const expectedStatuses = [
		400, // Bad Request
		401, // Unauthorized
		403, // Forbidden
		404, // Not Found
		409, // Conflict
		422, // Unprocessable Entity
		429, // Too Many Requests
	];

	return expectedStatuses.includes(status);
}

/**
 * Получить человекочитаемое сообщение об ошибке
 */
export function getErrorMessage(error: any): string {
	if (!error) return "Произошла ошибка";

	// FetchBaseQueryError
	if ("status" in error) {
		const status = error.status;

		// Серверные ошибки
		if (typeof status === "number") {
			if (status >= 500) {
				return `Ошибка сервера (${status})`;
			}
			if (status === 404) {
				return "Ресурс не найден";
			}
			if (status === 403) {
				return "Доступ запрещён";
			}
			if (status === 401) {
				return "Требуется авторизация";
			}
			if (status === 429) {
				return "Слишком много запросов";
			}
		}

		// Сетевые ошибки
		if (status === "FETCH_ERROR") {
			return "Ошибка подключения к серверу";
		}
		if (status === "PARSING_ERROR") {
			return "Ошибка обработки ответа";
		}
		if (status === "TIMEOUT_ERROR") {
			return "Превышено время ожидания";
		}

		// Сообщение от сервера
		if (error.data && typeof error.data === "object") {
			if ("message" in error.data) {
				return String(error.data.message);
			}
		}
	}

	// SerializedError
	if ("message" in error) {
		return String(error.message);
	}

	return "Произошла ошибка";
}
