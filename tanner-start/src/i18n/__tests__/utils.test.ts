import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	detectLocale,
	getBrowserLocale,
	getSavedLocale,
	isValidLocale,
	saveLocale,
} from "../utils";

describe("i18n utils", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	describe("saveLocale", () => {
		it("should save locale to localStorage", () => {
			saveLocale("en");
			expect(localStorage.getItem("app-locale")).toBe("en");
		});

		it("should save ru locale to localStorage", () => {
			saveLocale("ru");
			expect(localStorage.getItem("app-locale")).toBe("ru");
		});
	});

	describe("getSavedLocale", () => {
		it("should return saved locale from localStorage", () => {
			localStorage.setItem("app-locale", "en");
			expect(getSavedLocale()).toBe("en");
		});

		it("should return null if no locale is saved", () => {
			expect(getSavedLocale()).toBeNull();
		});

		it("should return null if saved locale is invalid", () => {
			localStorage.setItem("app-locale", "fr");
			expect(getSavedLocale()).toBeNull();
		});

		it("should return ru locale from localStorage", () => {
			localStorage.setItem("app-locale", "ru");
			expect(getSavedLocale()).toBe("ru");
		});
	});

	describe("isValidLocale", () => {
		it("should return true for valid ru locale", () => {
			expect(isValidLocale("ru")).toBe(true);
		});

		it("should return true for valid en locale", () => {
			expect(isValidLocale("en")).toBe(true);
		});

		it("should return false for invalid locale", () => {
			expect(isValidLocale("fr")).toBe(false);
		});

		it("should return false for empty string", () => {
			expect(isValidLocale("")).toBe(false);
		});

		it("should return false for random string", () => {
			expect(isValidLocale("invalid")).toBe(false);
		});
	});

	describe("getBrowserLocale", () => {
		it("should return browser locale if it is supported", () => {
			Object.defineProperty(navigator, "language", {
				value: "en-US",
				configurable: true,
			});
			expect(getBrowserLocale()).toBe("en");
		});

		it("should return default locale if browser locale is not supported", () => {
			Object.defineProperty(navigator, "language", {
				value: "fr-FR",
				configurable: true,
			});
			expect(getBrowserLocale()).toBe("ru");
		});

		it("should handle browser locale without region code", () => {
			Object.defineProperty(navigator, "language", {
				value: "ru",
				configurable: true,
			});
			expect(getBrowserLocale()).toBe("ru");
		});
	});

	describe("detectLocale", () => {
		it("should return saved locale if available", () => {
			localStorage.setItem("app-locale", "en");
			Object.defineProperty(navigator, "language", {
				value: "ru-RU",
				configurable: true,
			});
			expect(detectLocale()).toBe("en");
		});

		it("should return browser locale if no saved locale", () => {
			Object.defineProperty(navigator, "language", {
				value: "en-US",
				configurable: true,
			});
			expect(detectLocale()).toBe("en");
		});

		it("should return default locale if no saved locale and browser locale is not supported", () => {
			Object.defineProperty(navigator, "language", {
				value: "fr-FR",
				configurable: true,
			});
			expect(detectLocale()).toBe("ru");
		});

		it("should prioritize localStorage over browser settings", () => {
			localStorage.setItem("app-locale", "ru");
			Object.defineProperty(navigator, "language", {
				value: "en-US",
				configurable: true,
			});
			expect(detectLocale()).toBe("ru");
		});
	});
});
