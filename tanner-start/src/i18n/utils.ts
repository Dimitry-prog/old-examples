import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

const LOCALE_STORAGE_KEY = "app-locale";

/**
 * Сохранить выбранную локаль в localStorage
 */
export function saveLocale(locale: Locale): void {
	localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

/**
 * Получить сохраненную локаль из localStorage
 */
export function getSavedLocale(): Locale | null {
	const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
	return saved && LOCALES.includes(saved as Locale) ? (saved as Locale) : null;
}

/**
 * Определить локаль из настроек браузера
 */
export function getBrowserLocale(): Locale {
	const browserLang = navigator.language.split("-")[0];
	return LOCALES.includes(browserLang as Locale)
		? (browserLang as Locale)
		: DEFAULT_LOCALE;
}

/**
 * Автоматически определить локаль (из localStorage или браузера)
 */
export function detectLocale(): Locale {
	return getSavedLocale() ?? getBrowserLocale();
}

/**
 * Проверить, является ли строка валидной локалью
 */
export function isValidLocale(locale: string): locale is Locale {
	return LOCALES.includes(locale as Locale);
}
