import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	apiValidationUtils,
	formValidationUtils,
	validationUtils,
} from "../validation";

/**
 * Тесты для утилит валидации
 */
describe("Validation Utils", () => {
	const testSchema = z.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email"),
		age: z.number().min(18, "Must be at least 18 years old"),
	});

	describe("validationUtils.validate", () => {
		it("should validate correct data", () => {
			const data = {
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			};

			const result = validationUtils.validate(testSchema, data);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(data);
			}
		});

		it("should return errors for invalid data", () => {
			const data = {
				name: "J",
				email: "invalid-email",
				age: 16,
			};

			const result = validationUtils.validate(testSchema, data);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
				console.log("Error issues:", result.error.issues);
				console.log("Error errors:", result.error.errors);
				console.log("Formatted errors:", result.formattedError.errors);
				expect(result.formattedError.errors.length).toBeGreaterThanOrEqual(1);
			}
		});

		it("should handle partial data", () => {
			const data = {
				name: "John",
				// missing email and age
			};

			const result = validationUtils.validate(testSchema, data);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.formattedError.errors.length).toBeGreaterThan(0);
			}
		});
	});

	describe("validationUtils.validateAsync", () => {
		it("should validate data asynchronously", async () => {
			const data = {
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			};

			const result = await validationUtils.validateAsync(testSchema, data);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(data);
			}
		});

		it("should handle async validation errors", async () => {
			const data = {
				name: "J",
				email: "invalid",
				age: 16,
			};

			const result = await validationUtils.validateAsync(testSchema, data);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
			}
		});
	});

	describe("validationUtils.formatZodError", () => {
		it("should format Zod errors correctly", () => {
			const data = {
				name: "J",
				email: "invalid",
				age: 16,
			};

			const parseResult = testSchema.safeParse(data);
			if (!parseResult.success) {
				const formatted = validationUtils.formatZodError(parseResult.error);

				expect(formatted.message).toBe("Ошибка валидации данных");
				expect(formatted.errors).toHaveLength(3);
				expect(formatted.errors[0]).toHaveProperty("field");
				expect(formatted.errors[0]).toHaveProperty("message");
			}
		});
	});

	describe("validationUtils.getFirstError", () => {
		it("should return first error message", () => {
			const data = { name: "J", email: "invalid", age: 16 };
			const parseResult = testSchema.safeParse(data);

			if (!parseResult.success) {
				const firstError = validationUtils.getFirstError(parseResult.error);
				expect(typeof firstError).toBe("string");
				expect(firstError.length).toBeGreaterThan(0);
			}
		});
	});

	describe("validationUtils.getFieldErrors", () => {
		it("should group errors by field", () => {
			const data = { name: "J", email: "invalid", age: 16 };
			const parseResult = testSchema.safeParse(data);

			if (!parseResult.success) {
				const fieldErrors = validationUtils.getFieldErrors(parseResult.error);

				expect(fieldErrors).toHaveProperty("name");
				expect(fieldErrors).toHaveProperty("email");
				expect(fieldErrors).toHaveProperty("age");
				expect(Array.isArray(fieldErrors.name)).toBe(true);
			}
		});
	});

	describe("validationUtils.hasFieldError", () => {
		it("should check if field has error", () => {
			const data = { name: "J", email: "john@example.com", age: 25 };
			const parseResult = testSchema.safeParse(data);

			if (!parseResult.success) {
				expect(validationUtils.hasFieldError(parseResult.error, "name")).toBe(
					true,
				);
				expect(validationUtils.hasFieldError(parseResult.error, "email")).toBe(
					false,
				);
			}
		});
	});
});

/**
 * Тесты для утилит форм
 */
describe("Form Validation Utils", () => {
	const userSchema = z.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email"),
	});

	describe("formValidationUtils.validateField", () => {
		it("should validate single field", () => {
			const error = formValidationUtils.validateField(
				z.string().min(2, "Too short"),
				"J",
			);

			expect(error).toBe("Too short");
		});

		it("should return undefined for valid field", () => {
			const error = formValidationUtils.validateField(
				z.string().min(2, "Too short"),
				"John",
			);

			expect(error).toBeUndefined();
		});
	});

	describe("formValidationUtils.createFieldSchema", () => {
		it("should extract field schema from object schema", () => {
			const fieldSchema = formValidationUtils.createFieldSchema(
				userSchema,
				"email",
			);

			// Тестируем, что схема работает
			const validResult = fieldSchema.safeParse("test@example.com");
			const invalidResult = fieldSchema.safeParse("invalid-email");

			expect(validResult.success).toBe(true);
			expect(invalidResult.success).toBe(false);
		});
	});
});

/**
 * Тесты для API валидации
 */
describe("API Validation Utils", () => {
	describe("apiValidationUtils.isValidationError", () => {
		it("should identify validation errors", () => {
			const validationError = {
				message: "Validation failed",
				errors: [{ field: "email", message: "Invalid email" }],
			};

			const regularError = new Error("Something went wrong");

			expect(apiValidationUtils.isValidationError(validationError)).toBe(true);
			expect(apiValidationUtils.isValidationError(regularError)).toBe(false);
		});
	});

	describe("apiValidationUtils.extractValidationErrors", () => {
		it("should extract field errors from validation error", () => {
			const validationError = {
				message: "Validation failed",
				errors: [
					{ field: "email", message: "Invalid email" },
					{ field: "name", message: "Name is required" },
				],
			};

			const fieldErrors =
				apiValidationUtils.extractValidationErrors(validationError);

			expect(fieldErrors).toEqual({
				email: "Invalid email",
				name: "Name is required",
			});
		});

		it("should return empty object for non-validation errors", () => {
			const regularError = new Error("Something went wrong");
			const fieldErrors =
				apiValidationUtils.extractValidationErrors(regularError);

			expect(fieldErrors).toEqual({});
		});
	});

	describe("apiValidationUtils.createValidationError", () => {
		it("should create validation error object", () => {
			const fieldErrors = {
				email: "Invalid email",
				name: "Name is required",
			};

			const validationError = apiValidationUtils.createValidationError(
				"Validation failed",
				fieldErrors,
			);

			expect(validationError.message).toBe("Validation failed");
			expect(validationError.errors).toHaveLength(2);
			expect(validationError.errors[0]).toEqual({
				field: "email",
				message: "Invalid email",
			});
		});
	});
});

/**
 * Интеграционные тесты
 */
describe("Validation Integration", () => {
	it("should work with complex nested schemas", () => {
		const nestedSchema = z.object({
			user: z.object({
				profile: z.object({
					name: z.string().min(1),
					age: z.number().min(0),
				}),
				contacts: z.array(
					z.object({
						type: z.enum(["email", "phone"]),
						value: z.string().min(1),
					}),
				),
			}),
		});

		const validData = {
			user: {
				profile: {
					name: "John",
					age: 25,
				},
				contacts: [{ type: "email", value: "john@example.com" }],
			},
		};

		const result = validationUtils.validate(nestedSchema, validData);
		expect(result.success).toBe(true);
	});

	it("should handle validation with custom refinements", () => {
		const passwordSchema = z
			.object({
				password: z.string().min(8),
				confirmPassword: z.string(),
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: "Passwords do not match",
				path: ["confirmPassword"],
			});

		const invalidData = {
			password: "password123",
			confirmPassword: "different",
		};

		const result = validationUtils.validate(passwordSchema, invalidData);
		expect(result.success).toBe(false);

		if (!result.success) {
			const hasConfirmPasswordError = validationUtils.hasFieldError(
				result.error,
				"confirmPassword",
			);
			expect(hasConfirmPasswordError).toBe(true);
		}
	});
});
