import { i18n } from "@lingui/core";
import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Динамическая загрузка каталога переводов для указанной локали
 */
export async function loadCatalog(locale: Locale): Promise<void> {
	try {
		const { messages } = await import(`../locales/${locale}/messages.mjs`);
		i18n.load(locale, messages);
		i18n.activate(locale);
	} catch (error) {
		console.error(`Failed to load catalog for locale: ${locale}`, error);

		// Fallback на дефолтную локаль
		if (locale !== DEFAULT_LOCALE) {
			console.warn(`Falling back to default locale: ${DEFAULT_LOCALE}`);
			await loadCatalog(DEFAULT_LOCALE);
		}
	}
}

/**
 * Инициализация i18n с указанной локалью
 */
export async function initI18n(locale: Locale = DEFAULT_LOCALE): Promise<void> {
	await loadCatalog(locale);
}

export { i18n };
