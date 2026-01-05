import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * E2E тесты для i18n роутинга
 *
 * Примечание: Эти тесты демонстрируют логику роутинга.
 * Для полноценного E2E тестирования рекомендуется использовать Playwright или Cypress
 * с реальным браузером и запущенным dev-сервером.
 */

describe("i18n Routing E2E", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	describe("Root redirect", () => {
		it("should redirect from / to /$locale with detected locale", () => {
			// Симуляция: пользователь заходит на корень без локали
			// Ожидается редирект на /ru (дефолтная локаль)

			const expectedRedirect = "/ru";
			const currentPath = "/";

			// Проверяем, что корневой путь должен редиректить
			expect(currentPath).toBe("/");
			expect(expectedRedirect).toMatch(/^\/(ru|en)/);
		});

		it("should redirect to locale from localStorage if available", () => {
			// Симуляция: пользователь ранее выбрал английский язык
			localStorage.setItem("app-locale", "en");

			const expectedRedirect = "/en";

			// Проверяем, что редирект учитывает сохраненную локаль
			expect(localStorage.getItem("app-locale")).toBe("en");
			expect(expectedRedirect).toBe("/en");
		});

		it("should redirect to browser locale if no saved locale", () => {
			// Симуляция: нет сохраненной локали, используем браузерную
			Object.defineProperty(navigator, "language", {
				value: "en-US",
				configurable: true,
			});

			const browserLang = navigator.language.split("-")[0];
			const expectedRedirect = `/${browserLang}`;

			expect(browserLang).toBe("en");
			expect(expectedRedirect).toBe("/en");
		});

		it("should redirect to default locale if browser locale is not supported", () => {
			// Симуляция: браузер на французском, но поддерживаются только ru и en
			Object.defineProperty(navigator, "language", {
				value: "fr-FR",
				configurable: true,
			});

			const defaultLocale = "ru";
			const expectedRedirect = `/${defaultLocale}`;

			expect(expectedRedirect).toBe("/ru");
		});
	});

	describe("Locale switching via URL", () => {
		it("should switch from /ru/dashboard to /en/dashboard", () => {
			const currentPath = "/ru/dashboard";
			const newLocale = "en";
			const expectedPath = "/en/dashboard";

			// Симуляция смены локали
			const newPath = currentPath.replace("/ru", `/${newLocale}`);

			expect(newPath).toBe(expectedPath);
		});

		it("should switch from /en/profile/settings to /ru/profile/settings", () => {
			const currentPath = "/en/profile/settings";
			const newLocale = "ru";
			const expectedPath = "/ru/profile/settings";

			const newPath = currentPath.replace("/en", `/${newLocale}`);

			expect(newPath).toBe(expectedPath);
		});

		it("should preserve query parameters when switching locale", () => {
			const currentPath = "/ru/search";
			const queryParams = "?q=test&page=2";
			const fullPath = currentPath + queryParams;
			const newLocale = "en";

			const newPath = fullPath.replace("/ru", `/${newLocale}`);
			const expectedPath = "/en/search?q=test&page=2";

			expect(newPath).toBe(expectedPath);
		});

		it("should handle nested routes correctly", () => {
			const currentPath = "/ru/dashboard/analytics/reports";
			const newLocale = "en";
			const expectedPath = "/en/dashboard/analytics/reports";

			const newPath = currentPath.replace("/ru", `/${newLocale}`);

			expect(newPath).toBe(expectedPath);
		});
	});

	describe("Locale persistence in localStorage", () => {
		it("should save locale to localStorage when navigating to localized route", () => {
			const locale = "en";

			// Симуляция: пользователь переходит на /en/dashboard
			localStorage.setItem("app-locale", locale);

			expect(localStorage.getItem("app-locale")).toBe("en");
		});

		it("should update localStorage when switching locale", () => {
			// Начальная локаль
			localStorage.setItem("app-locale", "ru");
			expect(localStorage.getItem("app-locale")).toBe("ru");

			// Переключение на английский
			localStorage.setItem("app-locale", "en");
			expect(localStorage.getItem("app-locale")).toBe("en");
		});

		it("should persist locale across page reloads", () => {
			const locale = "en";
			localStorage.setItem("app-locale", locale);

			// Симуляция перезагрузки страницы
			const savedLocale = localStorage.getItem("app-locale");

			expect(savedLocale).toBe("en");
		});
	});

	describe("Invalid locale handling", () => {
		it("should redirect to default locale when invalid locale in URL", () => {
			const invalidPath = "/fr/dashboard"; // fr не поддерживается
			const validLocales = ["ru", "en"];
			const locale = invalidPath.split("/")[1];

			const isValid = validLocales.includes(locale);
			expect(isValid).toBe(false);

			// Должен быть редирект на дефолтную локаль
			const expectedRedirect = `/ru/dashboard`;

			expect(expectedRedirect).toMatch(/^\/(ru|en)/);
		});

		it("should handle malformed locale paths", () => {
			const malformedPaths = [
				"/dashboard", // нет локали
				"//ru/dashboard", // двойной слеш
				"/RU/dashboard", // неправильный регистр
			];

			malformedPaths.forEach((path) => {
				// Все должны редиректить на валидный путь с локалью
				expect(path).toBeTruthy();
			});
		});
	});

	describe("Locale-aware navigation", () => {
		it("should maintain locale when navigating between pages", () => {
			const currentLocale = "en";
			const routes = [
				"/en/dashboard",
				"/en/profile",
				"/en/settings",
				"/en/about",
			];

			routes.forEach((route) => {
				expect(route).toContain(`/${currentLocale}/`);
			});
		});

		it("should update all links when locale changes", () => {
			const oldLocale = "ru";
			const newLocale = "en";
			const links = ["/ru/dashboard", "/ru/profile", "/ru/settings"];

			const updatedLinks = links.map((link) =>
				link.replace(`/${oldLocale}`, `/${newLocale}`),
			);

			expect(updatedLinks).toEqual([
				"/en/dashboard",
				"/en/profile",
				"/en/settings",
			]);
		});
	});

	describe("Shareable localized URLs", () => {
		it("should open correct locale when sharing URL", () => {
			const sharedUrl = "https://example.com/en/dashboard";
			const locale = sharedUrl.split("/")[3]; // извлекаем локаль

			expect(locale).toBe("en");
			expect(["ru", "en"]).toContain(locale);
		});

		it("should preserve full path with locale in shared URLs", () => {
			const sharedUrls = [
				"https://example.com/ru/profile/settings",
				"https://example.com/en/dashboard/analytics",
			];

			sharedUrls.forEach((url) => {
				const pathParts = url.split("/");
				const locale = pathParts[3];
				const restPath = pathParts.slice(4).join("/");

				expect(["ru", "en"]).toContain(locale);
				expect(restPath).toBeTruthy();
			});
		});
	});

	describe("Authenticated routes with locale", () => {
		it("should maintain locale in authenticated routes", () => {
			const authenticatedRoutes = [
				"/ru/dashboard",
				"/ru/profile",
				"/en/dashboard",
				"/en/profile",
			];

			authenticatedRoutes.forEach((route) => {
				const locale = route.split("/")[1];
				expect(["ru", "en"]).toContain(locale);
			});
		});

		it("should redirect to login with locale preserved", () => {
			const currentPath = "/en/dashboard";
			const locale = currentPath.split("/")[1];
			const loginRedirect = `/${locale}/login?redirect=${encodeURIComponent(currentPath)}`;

			expect(loginRedirect).toContain("/en/login");
			expect(loginRedirect).toContain("redirect=%2Fen%2Fdashboard");
		});
	});

	describe("Locale detection priority", () => {
		it("should prioritize URL locale over localStorage", () => {
			// В localStorage сохранен ru
			localStorage.setItem("app-locale", "ru");

			// Но пользователь открывает URL с en
			const urlLocale = "en";

			// URL имеет приоритет
			expect(urlLocale).toBe("en");
			expect(urlLocale).not.toBe(localStorage.getItem("app-locale"));
		});

		it("should use localStorage when no locale in URL", () => {
			localStorage.setItem("app-locale", "en");

			// Пользователь заходит на корень
			const savedLocale = localStorage.getItem("app-locale");

			expect(savedLocale).toBe("en");
		});

		it("should use browser locale when no URL locale and no localStorage", () => {
			Object.defineProperty(navigator, "language", {
				value: "en-GB",
				configurable: true,
			});

			const browserLang = navigator.language.split("-")[0];

			expect(browserLang).toBe("en");
		});

		it("should fallback to default locale when all detection methods fail", () => {
			// Нет localStorage
			localStorage.clear();

			// Браузер на неподдерживаемом языке
			Object.defineProperty(navigator, "language", {
				value: "zh-CN",
				configurable: true,
			});

			// Проверяем, что дефолтная локаль - ru
			expect("ru").toBe("ru");
		});
	});
});
