import { i18n } from "./index";

/**
 * Упрощенная функция перевода с синтаксисом l('key', params)
 *
 * @example
 * // Простой перевод
 * l('page.title') // "Заголовок страницы"
 *
 * @example
 * // С параметрами
 * l('user.greetings', { name: 'Dimitry' }) // "Привет, Dimitry!"
 * l('user.days', { count: 24 }) // "24 дня"
 *
 * @example
 * // В атрибутах
 * <input placeholder={l('form.name')} />
 * <div title={l('tooltip.info', { count: 5 })}>...</div>
 *
 * @note
 * Функция l() работает с уже извлеченными ключами.
 * Для автоматической экстракции используйте макросы t и <Trans>.
 */
export function l(key: string, values?: Record<string, any>): string {
	return i18n._(key, values);
}
