// Типы для конфигурации маршрутов с правами доступа

import type { RoutePermissions } from "./permissions";

/**
 * Метаданные маршрута
 */
export type RouteMetadata = {
	/** Описание маршрута */
	description?: string;

	/** Иконка для меню */
	icon?: string;

	/** Порядок сортировки в меню */
	order?: number;

	/** Дополнительные данные */
	[key: string]: unknown;
};

/**
 * Конфигурация одного маршрута (метаданные для навигации)
 */
export type RouteConfig = {
	/** Путь маршрута (без префикса локали) */
	path: string;

	/** Название маршрута для отображения в меню */
	name: string;

	/** Права доступа, необходимые для доступа к маршруту */
	permissions: RoutePermissions;

	/** Скрыть маршрут из меню (но оставить доступным по URL) */
	isHideInMenu?: boolean;

	/** Дополнительные метаданные */
	meta?: RouteMetadata;
};

/**
 * Метаданные группы маршрутов
 */
export type RouteGroupMetadata = {
	/** Название группы для отображения */
	label?: string;

	/** Иконка группы */
	icon?: string;

	/** Порядок сортировки */
	order?: number;
};

/**
 * Группа маршрутов
 */
export type RouteGroup = {
	/** Идентификатор группы */
	group: string;

	/** Маршруты в группе */
	items: RouteConfig[];

	/** Метаданные группы */
	meta?: RouteGroupMetadata;
};

/**
 * Полная конфигурация маршрутов приложения
 */
export type RoutesConfig = RouteGroup[];

/**
 * Отфильтрованный маршрут (доступный пользователю)
 */
export type FilteredRoute = RouteConfig & {
	/** Полный путь с локалью */
	fullPath: string;

	/** Группа, к которой принадлежит маршрут */
	group: string;
};

/**
 * Результат фильтрации маршрутов
 */
export type FilteredRoutesResult = {
	/** Все доступные маршруты */
	routes: FilteredRoute[];

	/** Маршруты, сгруппированные по группам */
	groupedRoutes: Map<string, FilteredRoute[]>;

	/** Первый доступный маршрут (для редиректа по умолчанию) */
	firstRoute: FilteredRoute | null;

	/** Первый видимый маршрут в меню */
	firstVisibleRoute: FilteredRoute | null;
};
