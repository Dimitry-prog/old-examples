import type { LOCALES } from "./config";

export type Locale = (typeof LOCALES)[number]; // 'ru' | 'en'

export interface LocaleConfig {
	code: Locale;
	label: string;
	direction: "ltr" | "rtl";
}
