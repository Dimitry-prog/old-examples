import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Тип для обработчиков ошибок
 * Поддерживает любые HTTP статусы
 */
type ErrorHandlers = {
	[status: number]: () => React.ReactNode;
	default?: () => React.ReactNode;
};

/**
 * Утилита для обработки ошибок RTK Query в компонентах
 * Используется для специфичных статусов (403, 404, 422 и т.д.)
 *
 * @example
 * // Базовое использование
 * handleRtkError(error, {
 *   403: () => <div>Нет доступа</div>,
 *   404: () => <div>Не найдено</div>,
 *   default: () => <div>Ошибка</div>,
 * })
 *
 * @example
 * // С компонентами
 * handleRtkError(error, {
 *   403: () => <AccessDenied />,
 *   404: () => <NotFound />,
 * })
 */
export function handleRtkError(
	error: FetchBaseQueryError | SerializedError | undefined,
	handlers: ErrorHandlers,
): React.ReactNode {
	if (!error) return null;

	// FetchBaseQueryError - ошибка с сервера
	if ("status" in error) {
		const status = error.status;

		if (typeof status === "number") {
			// Проверяем наличие обработчика для конкретного статуса
			if (handlers[status]) {
				return handlers[status]();
			}
		}

		// Обработчик по умолчанию
		if (handlers.default) {
			return handlers.default();
		}

		// Если нет обработчика, возвращаем null
		return null;
	}

	// SerializedError - ошибка из createAsyncThunk
	if (handlers.default) {
		return handlers.default();
	}

	return null;
}

/**
 * Проверка типа ошибки
 */
export function isFetchBaseQueryError(
	error: unknown,
): error is FetchBaseQueryError {
	return typeof error === "object" && error != null && "status" in error;
}

/**
 * Проверка на SerializedError
 */
export function isSerializedError(error: unknown): error is SerializedError {
	return typeof error === "object" && error != null && "message" in error;
}

/**
 * Получение сообщения об ошибке
 */
export function getErrorMessage(
	error: FetchBaseQueryError | SerializedError | undefined,
): string {
	if (!error) return "Неизвестная ошибка";

	if (isFetchBaseQueryError(error)) {
		if ("error" in error) {
			return error.error;
		}
		if (
			"data" in error &&
			typeof error.data === "object" &&
			error.data !== null
		) {
			const data = error.data as Record<string, unknown>;
			if ("message" in data && typeof data.message === "string") {
				return data.message;
			}
		}
		return `Ошибка ${error.status}`;
	}

	if (isSerializedError(error)) {
		return error.message || "Неизвестная ошибка";
	}

	return "Неизвестная ошибка";
}

/**
 * Получение HTTP статуса ошибки
 */
export function getErrorStatus(
	error: FetchBaseQueryError | SerializedError | undefined,
): number | string | undefined {
	if (!error) return undefined;

	if (isFetchBaseQueryError(error)) {
		return error.status;
	}

	return undefined;
}

/**
 * Проверка на конкретный статус ошибки
 *
 * @example
 * if (isErrorStatus(error, 403)) {
 *   return <div>Нет доступа</div>
 * }
 */
export function isErrorStatus(
	error: FetchBaseQueryError | SerializedError | undefined,
	status: number,
): boolean {
	if (!error || !isFetchBaseQueryError(error)) return false;
	return error.status === status;
}

/**
 * Проверка на несколько статусов
 *
 * @example
 * if (isErrorStatusIn(error, [403, 404])) {
 *   return <div>Ошибка доступа или не найдено</div>
 * }
 */
export function isErrorStatusIn(
	error: FetchBaseQueryError | SerializedError | undefined,
	statuses: number[],
): boolean {
	if (!error || !isFetchBaseQueryError(error)) return false;
	return typeof error.status === "number" && statuses.includes(error.status);
}

/**
 * Упрощенная обработка ошибок с дефолтными сообщениями
 *
 * @example
 * return handleCommonErrors(error) || <div>Успех!</div>
 */
export function handleCommonErrors(
	error: FetchBaseQueryError | SerializedError | undefined,
	customMessages?: Partial<Record<number, string>>,
): React.ReactNode {
	if (!error) return null;

	const defaultMessages: Record<number, string> = {
		403: "У вас нет доступа к этому ресурсу",
		404: "Запрашиваемый ресурс не найден",
		422: "Неверные данные. Проверьте введенную информацию",
		500: "Ошибка сервера. Попробуйте позже",
		503: "Сервис временно недоступен",
	};

	const messages = { ...defaultMessages, ...customMessages };

	return handleRtkError(error, {
		...Object.fromEntries(
			Object.entries(messages).map(([status, message]) => [
				Number(status),
				() => <div className="text-red-600">{message}</div>,
			]),
		),
		default: () => (
			<div className="text-red-600">
				Произошла ошибка: {getErrorMessage(error)}
			</div>
		),
	});
}

/**
 * Хук для удобной работы с ошибками в компонентах
 *
 * @example
 * function MyComponent() {
 *   const { data, error } = useGetDataQuery()
 *   const errorHandler = useErrorHandler(error)
 *
 *   if (errorHandler.hasError) {
 *     return errorHandler.render({
 *       403: () => <AccessDenied />,
 *       404: () => <NotFound />,
 *     })
 *   }
 *
 *   return <div>{data}</div>
 * }
 */
export function useErrorHandler(
	error: FetchBaseQueryError | SerializedError | undefined,
) {
	return {
		hasError: !!error,
		error,
		status: getErrorStatus(error),
		message: getErrorMessage(error),
		is: (status: number) => isErrorStatus(error, status),
		isIn: (statuses: number[]) => isErrorStatusIn(error, statuses),
		render: (handlers: ErrorHandlers) => handleRtkError(error, handlers),
		renderCommon: (customMessages?: Partial<Record<number, string>>) =>
			handleCommonErrors(error, customMessages),
	};
}
