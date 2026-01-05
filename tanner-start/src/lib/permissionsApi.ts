// API клиент для работы с правами доступа

import type {
	PermissionsApiResponse,
	UserPermissions,
} from "@/types/permissions";
import { z } from "zod";
import { validationUtils } from "./validation";

/**
 * Схема валидации для ответа API с правами доступа
 */
const permissionsApiResponseSchema = z.object({
	permissions: z.array(z.string()),
	timestamp: z.number(),
});

/**
 * API методы для работы с правами доступа
 */
export const permissionsApi = {
	/**
	 * Получение прав доступа текущего пользователя
	 * @returns Promise с массивом прав доступа пользователя
	 * @throws Error если запрос не удался или данные невалидны
	 */
	fetchUserPermissions: async (): Promise<UserPermissions> => {
		try {
			// В реальном приложении это будет настоящий API запрос
			// const response = await api.get<PermissionsApiResponse>('permissions')
			// или
			// const response = await api.get<PermissionsApiResponse>('user/permissions')

			// Симуляция запроса с моковыми данными
			await new Promise((resolve) => setTimeout(resolve, 800));

			const mockResponse: PermissionsApiResponse = {
				permissions: [
					"/api.manager.dashboard.view",
					"/api.manager.dashboard.stats",
					"/api.manager.users.list",
					"/api.manager.users.view",
					"/api.manager.profile.view",
					"/api.manager.profile.edit",
					"/api.manager.settings.view",
				],
				timestamp: Date.now(),
			};

			// Валидируем ответ
			const validatedResponse = validationUtils.validate(
				permissionsApiResponseSchema,
				mockResponse,
			);

			if (!validatedResponse.success) {
				throw new Error(
					`Ошибка валидации ответа: ${validatedResponse.formattedError.message}`,
				);
			}

			return validatedResponse.data.permissions;
		} catch (error) {
			console.error("Fetch user permissions API error:", error);
			throw error;
		}
	},

	/**
	 * Проверка права доступа на сервере
	 * @param permission - право доступа для проверки
	 * @returns Promise с результатом проверки
	 * @throws Error если запрос не удался
	 */
	checkPermissionOnServer: async (permission: string): Promise<boolean> => {
		try {
			// Валидируем входные данные
			const validatedPermission = validationUtils.validate(
				z.string().min(1),
				permission,
			);

			if (!validatedPermission.success) {
				throw new Error(
					`Некорректное право доступа: ${validatedPermission.formattedError.message}`,
				);
			}

			// В реальном приложении:
			// const response = await api.post<{ hasPermission: boolean }>(
			//   'permissions/check',
			//   { permission: validatedPermission.data }
			// )
			// return response.hasPermission

			// Симуляция запроса
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Моковая логика проверки
			const mockPermissions = [
				"/api.manager.dashboard.view",
				"/api.manager.dashboard.stats",
				"/api.manager.users.list",
			];

			return mockPermissions.includes(validatedPermission.data);
		} catch (error) {
			console.error("Check permission on server API error:", error);
			throw error;
		}
	},

	/**
	 * Перезагрузка прав доступа пользователя
	 * Полезно после изменения ролей или прав доступа на сервере
	 * @returns Promise с обновленным массивом прав доступа
	 */
	refetchUserPermissions: async (): Promise<UserPermissions> => {
		// Используем тот же метод, что и для первоначальной загрузки
		return permissionsApi.fetchUserPermissions();
	},
};
