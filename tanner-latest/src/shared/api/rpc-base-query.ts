import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Custom baseQuery для работы с единым POST endpoint (RPC-style API)
 *
 * Все запросы отправляются на один endpoint методом POST
 * Тело запроса содержит:
 * - method: название метода/действия
 * - params: параметры запроса
 */

interface RPCRequest {
	method: string;
	params?: unknown;
}

interface RPCResponse<T = unknown> {
	result?: T;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
}

/**
 * Создает baseQuery для RPC-style API
 * @param baseUrl - базовый URL API
 * @param endpoint - путь к единому endpoint (по умолчанию '/')
 */
export const createRPCBaseQuery = (
	baseUrl: string,
	endpoint = "/",
): BaseQueryFn<RPCRequest | string, unknown, FetchBaseQueryError> => {
	return async (args, api, _extraOptions) => {
		// Если передана строка, преобразуем в объект
		const rpcRequest: RPCRequest =
			typeof args === "string" ? { method: args } : args;

		try {
			const response = await fetch(`${baseUrl}${endpoint}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// Добавляем токен авторизации, если он есть
					...(localStorage.getItem("authToken") && {
						Authorization: `Bearer ${localStorage.getItem("authToken")}`,
					}),
				},
				body: JSON.stringify(rpcRequest),
				signal: api.signal,
			});

			const data: RPCResponse = await response.json();

			// Проверяем наличие ошибки в ответе
			if (data.error) {
				return {
					error: {
						status: data.error.code,
						data: data.error.data || data.error.message,
					},
				};
			}

			// Проверяем HTTP статус
			if (!response.ok) {
				return {
					error: {
						status: response.status,
						data: data || response.statusText,
					},
				};
			}

			return { data: data.result };
		} catch (error) {
			return {
				error: {
					status: "FETCH_ERROR",
					error: String(error),
				},
			};
		}
	};
};
