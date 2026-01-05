import { z } from "zod";
import type { ValidationError } from "./schemas";

/**
 * Результат валидации
 */
export type ValidationResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: z.ZodError;
			formattedError: ValidationError;
	  };

/**
 * Утилиты для валидации данных
 */
export const validationUtils = {
	/**
	 * Валидация данных с помощью Zod схемы
	 */
	validate: <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
		const result = schema.safeParse(data);

		if (result.success) {
			return {
				success: true,
				data: result.data,
			};
		}

		return {
			success: false,
			error: result.error,
			formattedError: validationUtils.formatZodError(result.error),
		};
	},

	/**
	 * Асинхронная валидация данных
	 */
	validateAsync: async <T>(
		schema: z.ZodSchema<T>,
		data: unknown,
	): Promise<ValidationResult<T>> => {
		try {
			const result = await schema.safeParseAsync(data);

			if (result.success) {
				return {
					success: true,
					data: result.data,
				};
			}

			return {
				success: false,
				error: result.error,
				formattedError: validationUtils.formatZodError(result.error),
			};
		} catch (error) {
			// Создаем ZodError для неожиданных ошибок
			const zodError = new z.ZodError([
				{
					code: "custom",
					message:
						error instanceof Error
							? error.message
							: "Неизвестная ошибка валидации",
					path: [],
				},
			]);

			return {
				success: false,
				error: zodError,
				formattedError: validationUtils.formatZodError(zodError),
			};
		}
	},

	/**
	 * Форматирование ошибок Zod для отображения пользователю
	 */
	formatZodError: (error: z.ZodError): ValidationError => {
		return {
			message: "Ошибка валидации данных",
			errors: (error.errors || []).map((err) => ({
				field: err.path.join("."),
				message: err.message,
				code: err.code,
			})),
		};
	},

	/**
	 * Получение первой ошибки валидации
	 */
	getFirstError: (error: z.ZodError): string => {
		const firstError = error.errors?.[0];
		return firstError ? firstError.message : "Ошибка валидации";
	},

	/**
	 * Получение ошибок по полям
	 */
	getFieldErrors: (error: z.ZodError): Record<string, string[]> => {
		const fieldErrors: Record<string, string[]> = {};

		(error.errors || []).forEach((err) => {
			const field = err.path.join(".");
			if (!fieldErrors[field]) {
				fieldErrors[field] = [];
			}
			fieldErrors[field].push(err.message);
		});

		return fieldErrors;
	},

	/**
	 * Проверка, содержит ли ошибка конкретное поле
	 */
	hasFieldError: (error: z.ZodError, field: string): boolean => {
		return (error.errors || []).some((err) => err.path.join(".") === field);
	},

	/**
	 * Получение ошибок для конкретного поля
	 */
	getFieldError: (error: z.ZodError, field: string): string[] => {
		return (error.errors || [])
			.filter((err) => err.path.join(".") === field)
			.map((err) => err.message);
	},
};

/**
 * Декоратор для валидации API ответов
 */
export const withValidation = <T>(schema: z.ZodSchema<T>) => {
	return (
		target: any,
		propertyName: string,
		descriptor: PropertyDescriptor,
	) => {
		const method = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			try {
				const result = await method.apply(this, args);
				const validation = validationUtils.validate(schema, result);

				if (!validation.success) {
					console.error(
						"API response validation failed:",
						validation.formattedError,
					);
					throw new Error(
						`Ошибка валидации ответа API: ${validation.formattedError.message}`,
					);
				}

				return validation.data;
			} catch (error) {
				console.error(`API method ${propertyName} failed:`, error);
				throw error;
			}
		};

		return descriptor;
	};
};

/**
 * Создание валидатора для API клиента
 */
export const createApiValidator = <TRequest, TResponse>(
	requestSchema?: z.ZodSchema<TRequest>,
	responseSchema?: z.ZodSchema<TResponse>,
) => {
	return {
		validateRequest: (data: unknown): TRequest => {
			if (!requestSchema) return data as TRequest;

			const result = validationUtils.validate(requestSchema, data);
			if (!result.success) {
				throw new Error(
					`Ошибка валидации запроса: ${result.formattedError.message}`,
				);
			}

			return result.data;
		},

		validateResponse: (data: unknown): TResponse => {
			if (!responseSchema) return data as TResponse;

			const result = validationUtils.validate(responseSchema, data);
			if (!result.success) {
				console.error("Response validation failed:", result.formattedError);
				throw new Error(
					`Ошибка валидации ответа: ${result.formattedError.message}`,
				);
			}

			return result.data;
		},
	};
};

/**
 * Middleware для валидации API запросов
 */
export const validationMiddleware = <T>(schema: z.ZodSchema<T>) => {
	return async (data: unknown): Promise<T> => {
		const result = await validationUtils.validateAsync(schema, data);

		if (!result.success) {
			throw new Error(`Ошибка валидации: ${result.formattedError.message}`);
		}

		return result.data;
	};
};

/**
 * Хелперы для работы с формами
 */
export const formValidationUtils = {
	/**
	 * Создание валидатора для React Hook Form
	 */
	createResolver: <T>(schema: z.ZodSchema<T>) => {
		return async (data: unknown) => {
			const result = await validationUtils.validateAsync(schema, data);

			if (result.success) {
				return {
					values: result.data,
					errors: {},
				};
			}

			const fieldErrors = validationUtils.getFieldErrors(result.error);
			const formErrors: Record<string, { message: string }> = {};

			Object.entries(fieldErrors).forEach(([field, messages]) => {
				formErrors[field] = { message: messages[0] };
			});

			return {
				values: {},
				errors: formErrors,
			};
		};
	},

	/**
	 * Валидация поля формы
	 */
	validateField: <T>(
		schema: z.ZodSchema<T>,
		value: unknown,
	): string | undefined => {
		const result = validationUtils.validate(schema, value);

		if (result.success) {
			return undefined;
		}

		return validationUtils.getFirstError(result.error);
	},

	/**
	 * Создание схемы для поля формы
	 */
	createFieldSchema: <T extends z.ZodRawShape>(
		objectSchema: z.ZodObject<T>,
		fieldName: keyof T,
	): z.ZodSchema<any> => {
		return objectSchema.shape[fieldName];
	},
};

/**
 * Утилиты для работы с API ошибками
 */
export const apiValidationUtils = {
	/**
	 * Проверка, является ли ошибка ошибкой валидации
	 */
	isValidationError: (error: unknown): error is ValidationError => {
		return (
			typeof error === "object" &&
			error !== null &&
			"message" in error &&
			"errors" in error &&
			Array.isArray((error as any).errors)
		);
	},

	/**
	 * Извлечение ошибок валидации из API ошибки
	 */
	extractValidationErrors: (error: unknown): Record<string, string> => {
		if (!apiValidationUtils.isValidationError(error)) {
			return {};
		}

		const fieldErrors: Record<string, string> = {};
		error.errors.forEach((err) => {
			fieldErrors[err.field] = err.message;
		});

		return fieldErrors;
	},

	/**
	 * Создание ошибки валидации
	 */
	createValidationError: (
		message: string,
		fieldErrors: Record<string, string>,
	): ValidationError => {
		return {
			message,
			errors: Object.entries(fieldErrors).map(([field, message]) => ({
				field,
				message,
			})),
		};
	},
};
