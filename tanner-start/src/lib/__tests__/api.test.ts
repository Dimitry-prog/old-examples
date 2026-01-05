import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiErrorUtils } from "../api";

describe("API Client", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("apiErrorUtils", () => {
		it("should identify API errors correctly", () => {
			const apiError = new Error("API Error");
			Object.assign(apiError, { status: 404 });

			expect(apiErrorUtils.isApiError(apiError)).toBe(true);
			expect(apiErrorUtils.isApiError(new Error("Regular error"))).toBe(false);
		});

		it("should get error message from API error", () => {
			const apiError = new Error("Not found");
			Object.assign(apiError, { status: 404 });

			expect(apiErrorUtils.getErrorMessage(apiError)).toBe("Not found");
		});

		it("should get error message from regular error", () => {
			const error = new Error("Something went wrong");
			expect(apiErrorUtils.getErrorMessage(error)).toBe("Something went wrong");
		});

		it("should identify client errors (4xx)", () => {
			const clientError = new Error("Bad request");
			Object.assign(clientError, { status: 400 });

			expect(apiErrorUtils.isClientError(clientError)).toBe(true);
			expect(apiErrorUtils.isServerError(clientError)).toBe(false);
		});

		it("should identify server errors (5xx)", () => {
			const serverError = new Error("Internal server error");
			Object.assign(serverError, { status: 500 });

			expect(apiErrorUtils.isServerError(serverError)).toBe(true);
			expect(apiErrorUtils.isClientError(serverError)).toBe(false);
		});

		it("should format user-friendly error messages", () => {
			const error400 = new Error("Bad request");
			Object.assign(error400, { status: 400 });
			expect(apiErrorUtils.formatUserError(error400)).toBe(
				"Неверные данные запроса",
			);

			const error401 = new Error("Unauthorized");
			Object.assign(error401, { status: 401 });
			expect(apiErrorUtils.formatUserError(error401)).toBe(
				"Необходима авторизация",
			);

			const error404 = new Error("Not found");
			Object.assign(error404, { status: 404 });
			expect(apiErrorUtils.formatUserError(error404)).toBe("Ресурс не найден");

			const error500 = new Error("Server error");
			Object.assign(error500, { status: 500 });
			expect(apiErrorUtils.formatUserError(error500)).toBe(
				"Внутренняя ошибка сервера",
			);
		});

		it("should identify network errors", () => {
			const networkError = new Error("Failed to fetch");
			expect(apiErrorUtils.isNetworkError(networkError)).toBe(true);

			const regularError = new Error("Something else");
			expect(apiErrorUtils.isNetworkError(regularError)).toBe(false);
		});
	});
});
